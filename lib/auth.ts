import 'server-only';
import { cookies } from 'next/headers';
import { basePath } from './config';
import { SESSION_COOKIE, SESSION_HOURS, readSession, type Role } from './session';
import { getStaff } from './staff';

export type Session = { role: Role; sub: string; name: string; isOwner: boolean; staffId: number | null };

/**
 * The signed-in person, or null. Unlike the middleware check, this also confirms a staff account
 * still exists, is active, and has not been signed out (password reset, role change, pause).
 */
export async function getSession(): Promise<Session | null> {
  const t = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!t) return null;
  if (t.sub === 'owner') return { role: 'admin', sub: 'owner', name: 'Owner', isOwner: true, staffId: null };
  const s = await getStaff(Number(t.sub)).catch(() => null);
  if (!s || !s.active || s.session_epoch !== t.epoch || s.role !== t.role) return null;
  return { role: s.role, sub: t.sub, name: s.display_name, isOwner: false, staffId: s.id };
}

/** For server actions and routes: throws unless the person is signed in with one of these roles. */
export async function requireRole(...allowed: Role[]): Promise<Session> {
  const s = await getSession();
  if (!s || !allowed.includes(s.role)) throw new Error('Unauthorised');
  return s;
}

const cookiePath = basePath || '/';

/** Stores a session token from createSession() in the httpOnly cookie. Server actions only. */
export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: cookiePath,
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: cookiePath });
}
