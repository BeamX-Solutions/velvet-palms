import 'server-only';
import { randomInt } from 'node:crypto';
import { db } from './db';

export type Sitting = {
  id: number;
  label: string;
  starts_at: Date;
  capacity: number;
  is_open: boolean;
  taken: number;
  seats_left: number;
};

export type Reservation = {
  id: string;
  code: string;
  sitting_id: number;
  sitting_label: string;
  starts_at: Date;
  full_name: string;
  email: string;
  phone: string;
  party_size: number;
  occasion: string | null;
  notes: string | null;
  status: 'confirmed' | 'cancelled';
  checked_in_at: Date | null;
  created_at: Date;
};

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I
export function newCode() {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `VP-${s}`;
}

/** Nigerian numbers to one canonical form: 2348012345678. */
export function normalisePhone(raw: string) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 11) d = '234' + d.slice(1);
  if (d.length === 10 && !d.startsWith('234')) d = '234' + d;
  return d;
}

export async function getSittings(): Promise<Sitting[]> {
  const rows = await db()<Sitting[]>`
    select s.id, s.label, s.starts_at, s.capacity, s.is_open,
           coalesce(sum(r.party_size) filter (where r.status = 'confirmed'), 0)::int as taken
    from sittings s left join reservations r on r.sitting_id = s.id
    group by s.id order by s.starts_at`;
  return rows.map((s) => ({ ...s, seats_left: Math.max(s.capacity - s.taken, 0) }));
}

export type ReserveInput = {
  sittingId: number;
  fullName: string;
  email: string;
  phone: string;
  partySize: number;
  occasion?: string;
  notes?: string;
};

export type ReserveResult =
  | { ok: true; code: string }
  | { ok: false; reason: 'full' | 'closed' | 'duplicate' | 'no_sitting' | 'error'; seatsLeft?: number };

export async function reserve(input: ReserveInput): Promise<ReserveResult> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newCode();
    try {
      const [row] = await db()<{ ok: boolean; reason: string | null; res_code: string | null; seats_left: number }[]>`
        select * from reserve_seats(${input.sittingId}, ${input.fullName}, ${input.email},
          ${input.phone}, ${input.partySize}, ${input.occasion ?? null}, ${input.notes ?? null}, ${code})`;
      if (row.ok && row.res_code) return { ok: true, code: row.res_code };
      return { ok: false, reason: (row.reason as never) ?? 'error', seatsLeft: row.seats_left };
    } catch (e: unknown) {
      const err = e as { code?: string; constraint_name?: string };
      // unique_violation: either a code collision (retry) or a race on email/phone (duplicate)
      if (err.code === '23505') {
        if (err.constraint_name?.includes('code')) continue;
        return { ok: false, reason: 'duplicate' };
      }
      console.error('reserve failed', e);
      return { ok: false, reason: 'error' };
    }
  }
  return { ok: false, reason: 'error' };
}

export async function getReservation(code: string): Promise<Reservation | null> {
  if (!/^VP-[A-Z0-9]{8}$/.test(code)) return null;
  const [row] = await db()<Reservation[]>`
    select r.*, s.label as sitting_label, s.starts_at
    from reservations r join sittings s on s.id = r.sitting_id
    where r.code = ${code}`;
  return row ?? null;
}

export async function cancelReservation(code: string) {
  await db()`update reservations set status = 'cancelled', cancelled_at = now()
             where code = ${code} and status = 'confirmed'`;
}

export async function joinWaitlist(w: { fullName: string; email: string; phone: string; partySize: number }) {
  await db()`insert into waitlist (full_name, email, phone, party_size)
             values (${w.fullName}, ${w.email.toLowerCase()}, ${w.phone}, ${w.partySize})
             on conflict (lower(email)) do nothing`;
}

// ---------- admin ----------
export async function listReservations(): Promise<Reservation[]> {
  return db()<Reservation[]>`
    select r.*, s.label as sitting_label, s.starts_at
    from reservations r join sittings s on s.id = r.sitting_id
    order by s.starts_at, r.status, r.created_at`;
}

export async function listWaitlist() {
  return db()<{ id: string; full_name: string; email: string; phone: string; party_size: number; created_at: Date }[]>`
    select * from waitlist order by created_at`;
}

export async function setCheckedIn(code: string, checkedIn: boolean) {
  if (checkedIn) {
    await db()`update reservations set checked_in_at = now()
               where code = ${code} and status = 'confirmed' and checked_in_at is null`;
  } else {
    await db()`update reservations set checked_in_at = null where code = ${code}`;
  }
}

export async function setSittingOpen(id: number, open: boolean) {
  await db()`update sittings set is_open = ${open} where id = ${id}`;
}

/** For public pages: never let a database hiccup break the page. */
export async function safeSittings(): Promise<Sitting[] | null> {
  try { return await getSittings(); } catch (e) { console.error('sittings unavailable', e); return null; }
}
