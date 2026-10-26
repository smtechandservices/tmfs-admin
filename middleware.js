import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from './lib/session';

// Everything is private except the login page. This only checks that a
// session cookie exists; tmfs-backend verifies the token on every call and a
// rejected one lands back on /login.
export function middleware(request) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = request.nextUrl.pathname === '/' ? '' : `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!login|_next/|favicon|logo|icon|apple-icon).*)'],
};
