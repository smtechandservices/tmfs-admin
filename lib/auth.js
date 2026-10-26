import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { request } from './api';
import { SESSION_COOKIE, SESSION_TTL } from './session';

/**
 * `{ user, counts }` for the signed-in member, or null. The backend re-checks
 * the token on every call, so deactivation is immediate. Cached per request:
 * the layout and the page share one lookup.
 */
export const session = cache(async () => {
  if (!(await cookies()).get(SESSION_COOKIE)) return null;
  const res = await request('/api/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Backend ${res.status} on /api/auth/me`);
  return res.json();
});

export async function currentUser() {
  return (await session())?.user ?? null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/');
  return user;
}

export async function startSession(token) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
