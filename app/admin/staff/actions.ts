'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole, setSessionCookie } from '@/lib/auth';
import { createSession, type Role } from '@/lib/session';
import {
  MIN_PASSWORD, addStaff, getStaff, removeStaff, renameStaff, setStaffActive, setStaffPassword, setStaffRole, usernameTaken,
} from '@/lib/staff';

export type FormState = { ok?: string; error?: string; key?: number };

const name = z.string().trim().min(1, 'Enter their name.').max(60, 'Keep the name under 60 characters.');
const role = z.enum(['admin', 'door'], { message: 'Choose a role.' });
const password = z.string().min(MIN_PASSWORD, `Passwords need at least ${MIN_PASSWORD} characters.`).max(200);
const username = z.string().trim().toLowerCase()
  .min(3, 'Usernames need at least 3 characters.').max(32, 'Keep the username under 32 characters.')
  .regex(/^[a-z0-9._-]+$/, 'Usernames can use letters, numbers, dots, dashes and underscores only.');

const roleName = (r: Role) => (r === 'admin' ? 'admin' : 'door staff');
const fail = (error: string): FormState => ({ error });
const done = (ok: string): FormState => { revalidatePath('/admin/staff'); return { ok, key: Date.now() }; };

export async function createStaff(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireRole('admin');
  const parsed = z.object({ name, username, role, password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const s = parsed.data;
  if (s.username === (process.env.ADMIN_USER ?? '').toLowerCase() || (await usernameTaken(s.username))) {
    return fail(`The username "${s.username}" is already taken.`);
  }
  try {
    await addStaff({ username: s.username, displayName: s.name, role: s.role, password: s.password, createdBy: me.name });
  } catch (e) {
    console.error('add staff failed', e);
    return fail('Could not save. Please try again.');
  }
  return done(`${s.name} can now sign in as ${roleName(s.role)} with the username "${s.username}".`);
}

/** One action for every change on a staff row; the "op" field says which. */
export async function updateStaff(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireRole('admin');
  const id = Number(form.get('id'));
  const target = Number.isInteger(id) ? await getStaff(id) : null;
  if (!target) return fail('That person no longer exists. Refresh the page.');
  const self = me.staffId === target.id;
  const op = String(form.get('op'));

  // Admins cannot lock themselves out; the owner login or another admin can make these changes.
  if (self && (op === 'remove' || op === 'pause' || (op === 'role' && form.get('role') !== 'admin'))) {
    return fail('You cannot do that to your own account. Ask another admin.');
  }

  switch (op) {
    case 'rename': {
      const r = name.safeParse(form.get('name'));
      if (!r.success) return fail(r.error.issues[0].message);
      await renameStaff(id, r.data);
      return done(`Renamed to ${r.data}.`);
    }
    case 'role': {
      const r = role.safeParse(form.get('role'));
      if (!r.success) return fail(r.error.issues[0].message);
      if (r.data === target.role) return fail(`${target.display_name} is already ${roleName(r.data)}.`);
      await setStaffRole(id, r.data);
      return done(`${target.display_name} is now ${roleName(r.data)}. They have been signed out to pick up the change.`);
    }
    case 'password': {
      const r = password.safeParse(form.get('password'));
      if (!r.success) return fail(r.error.issues[0].message);
      await setStaffPassword(id, r.data);
      if (self) {
        // Changing your own password signs out your other devices but keeps you signed in here.
        const fresh = await getStaff(id);
        if (fresh) await setSessionCookie(await createSession({ role: fresh.role, sub: String(id), epoch: fresh.session_epoch }));
        return done('Your password has been changed. Your other devices have been signed out.');
      }
      return done(`New password set for ${target.display_name}. They have been signed out everywhere.`);
    }
    case 'pause':
      await setStaffActive(id, false);
      return done(`${target.display_name} is paused and has been signed out. Reactivate them any time.`);
    case 'activate':
      await setStaffActive(id, true);
      return done(`${target.display_name} can sign in again.`);
    case 'remove':
      await removeStaff(id);
      return done(`${target.display_name} has been removed.`);
    default:
      return fail('Unknown change.');
  }
}
