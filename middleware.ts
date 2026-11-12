import { NextResponse, type NextRequest } from 'next/server';

// Basic-auth gate for the staff area.
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return new NextResponse('Admin is not configured', { status: 503 });
  const header = req.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [u, ...rest] = atob(encoded).split(':');
    if (u === user && rest.join(':') === pass) return NextResponse.next();
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Velvet Palms staff"' },
  });
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
