import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, adminConfigured, readSession } from '@/lib/session';

// Gate for the staff area: pages without a valid session go to the login page.
// Door staff can use the guest list and check-in pages; the CSV export is admin only.
// This only checks the cookie's signature; pages and actions re-check the account (lib/auth.ts).
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path === '/admin/login') return NextResponse.next();
  if (!adminConfigured()) return new NextResponse('Admin is not configured', { status: 503 });
  const role = (await readSession(req.cookies.get(SESSION_COOKIE)?.value))?.role;

  if (path.startsWith('/api/')) {
    if (role === 'admin') return NextResponse.next();
    return new NextResponse(role ? 'Admin only' : 'Sign in required', { status: role ? 403 : 401 });
  }
  if (role) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = path === '/admin' ? '' : `?next=${encodeURIComponent(path)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'] };
