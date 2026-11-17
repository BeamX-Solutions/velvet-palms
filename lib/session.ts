// Signed, expiring session cookie. Web Crypto only, so it runs in middleware as well as on the server.
// Middleware can only check the signature; lib/auth.ts also checks the staff account is still valid.
//
// Token: role.subject.epoch.expires.signature
//   subject is "owner" (the ADMIN_USER / ADMIN_PASSWORD login) or a staff id from the database.
//   epoch must match the staff row's session_epoch, so bumping it signs that person out everywhere.
// The signing key is derived from the owner login, so changing ADMIN_PASSWORD signs everyone out.

export const SESSION_COOKIE = 'vp_staff';
export const SESSION_HOURS = 12;

export type Role = 'admin' | 'door';
export type Token = { role: Role; sub: string; epoch: number; expires: number };

const enc = new TextEncoder();
const env = (k: string) => process.env[k] ?? '';

async function sign(value: string): Promise<string> {
  const secret = `velvet-palms-session\n${env('ADMIN_USER')}\n${env('ADMIN_PASSWORD')}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Compares two strings without leaking where they differ through timing. */
export function safeEqual(a: string, b: string): boolean {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export const adminConfigured = () => !!(env('ADMIN_USER') && env('ADMIN_PASSWORD'));

/** True if these are the owner credentials from the environment. */
export function isOwnerLogin(user: string, pass: string): boolean {
  const checks = [safeEqual(user.toLowerCase(), env('ADMIN_USER').toLowerCase()), safeEqual(pass, env('ADMIN_PASSWORD'))];
  return adminConfigured() && checks.every(Boolean);
}

export async function createSession(t: Omit<Token, 'expires'>): Promise<string> {
  const payload = `${t.role}.${t.sub}.${t.epoch}.${Date.now() + SESSION_HOURS * 3600_000}`;
  return `${payload}.${await sign(payload)}`;
}

/** Checks the signature and expiry only. Returns the token's contents, or null. */
export async function readSession(token: string | undefined): Promise<Token | null> {
  if (!token || !adminConfigured()) return null;
  const parts = token.split('.');
  if (parts.length !== 5) return null;
  const [role, sub, epoch, expires, sig] = parts;
  if ((role !== 'admin' && role !== 'door') || !/^(owner|\d+)$/.test(sub) || !/^\d+$/.test(epoch)) return null;
  if (!(Number(expires) > Date.now())) return null;
  if (!safeEqual(sig, await sign(parts.slice(0, 4).join('.')))) return null;
  return { role, sub, epoch: Number(epoch), expires: Number(expires) };
}

/** Only allow returning to pages inside the staff area after login. */
export function safeNext(next: unknown): string {
  return typeof next === 'string' && /^\/admin(\/[\w\-/]*)?$/.test(next) && !next.startsWith('/admin/login') ? next : '/admin';
}
