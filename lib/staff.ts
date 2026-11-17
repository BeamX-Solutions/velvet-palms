import 'server-only';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './db';
import type { Role } from './session';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export type StaffMember = {
  id: number;
  username: string;
  display_name: string;
  role: Role;
  active: boolean;
  session_epoch: number;
  created_at: Date;
  created_by: string | null;
  last_login_at: Date | null;
};

export const MIN_PASSWORD = 8;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function checkPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

// A real hash to compare against when the username does not exist, so timing does not reveal it.
const dummyHash = hashPassword(randomBytes(12).toString('hex'));

export async function listStaff(): Promise<StaffMember[]> {
  return db()<StaffMember[]>`select id, username, display_name, role, active, session_epoch, created_at, created_by, last_login_at from staff order by active desc, role, lower(display_name)`;
}

export async function getStaff(id: number): Promise<StaffMember | null> {
  const [row] = await db()<StaffMember[]>`select id, username, display_name, role, active, session_epoch, created_at, created_by, last_login_at from staff where id = ${id}`;
  return row ?? null;
}

/** Returns the active staff member these credentials belong to, or null. */
export async function findLogin(username: string, password: string): Promise<StaffMember | null> {
  const sql = db();
  const [row] = await sql<(StaffMember & { password_hash: string })[]>`
    select id, username, display_name, role, active, session_epoch, created_at, created_by, last_login_at, password_hash from staff where lower(username) = ${username.toLowerCase()}`;
  const ok = await checkPassword(password, row?.password_hash ?? (await dummyHash));
  if (!row || !ok || !row.active) return null;
  await sql`update staff set last_login_at = now() where id = ${row.id}`;
  const { password_hash: _, ...member } = row;
  return member;
}

export async function usernameTaken(username: string): Promise<boolean> {
  const [row] = await db()`select 1 from staff where lower(username) = ${username.toLowerCase()}`;
  return !!row;
}

export async function addStaff(s: { username: string; displayName: string; role: Role; password: string; createdBy: string }) {
  await db()`insert into staff (username, display_name, role, password_hash, created_by)
             values (${s.username}, ${s.displayName}, ${s.role}, ${await hashPassword(s.password)}, ${s.createdBy})`;
}

// Each change below that affects access bumps session_epoch, which signs that person out everywhere.
export async function setStaffPassword(id: number, password: string) {
  await db()`update staff set password_hash = ${await hashPassword(password)}, session_epoch = session_epoch + 1 where id = ${id}`;
}
export async function setStaffRole(id: number, role: Role) {
  await db()`update staff set role = ${role}, session_epoch = session_epoch + 1 where id = ${id} and role <> ${role}`;
}
export async function setStaffActive(id: number, active: boolean) {
  await db()`update staff set active = ${active}, session_epoch = session_epoch + 1 where id = ${id}`;
}
export async function renameStaff(id: number, displayName: string) {
  await db()`update staff set display_name = ${displayName} where id = ${id}`;
}
export async function removeStaff(id: number) {
  await db()`delete from staff where id = ${id}`;
}
