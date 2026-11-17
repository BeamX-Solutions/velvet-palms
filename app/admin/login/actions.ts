'use server';
import { redirect } from 'next/navigation';
import { clearSessionCookie, setSessionCookie } from '@/lib/auth';
import { createSession, isOwnerLogin, safeNext } from '@/lib/session';
import { findLogin } from '@/lib/staff';

export async function login(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const user = String(form.get('user') ?? '').trim();
  const pass = String(form.get('password') ?? '');
  let token: string | null = null;
  if (isOwnerLogin(user, pass)) {
    token = await createSession({ role: 'admin', sub: 'owner', epoch: 0 });
  } else if (user && pass) {
    const s = await findLogin(user, pass).catch((e) => { console.error('staff login failed', e); return null; });
    if (s) token = await createSession({ role: s.role, sub: String(s.id), epoch: s.session_epoch });
  }
  if (!token) {
    await new Promise((r) => setTimeout(r, 800)); // slow down password guessing
    return { error: 'That name and password do not match. Please try again.' };
  }
  await setSessionCookie(token);
  redirect(safeNext(form.get('next')));
}

export async function logout() {
  await clearSessionCookie();
  redirect('/admin/login');
}
