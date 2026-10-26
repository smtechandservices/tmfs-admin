import 'server-only';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { SESSION_COOKIE } from './session';

// Every page and action reads and writes through the Django backend
// (tmfs-backend). Calls run on this server with the signed-in member's token
// from the httpOnly session cookie; the browser never talks to Django.

export const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

/** Raw fetch against the backend. `token: null` skips the session token. */
export async function request(path, { method = 'GET', body, query, token } = {}) {
  const url = new URL(`${BACKEND_URL}${path}`);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  if (token === undefined) token = (await cookies()).get(SESSION_COOKIE)?.value;
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
}

/** JSON GET for pages: a lapsed session goes to /login, a missing record to the 404 page. */
export async function api(path, opts) {
  const res = await request(path, opts);
  if (res.status === 401) redirect('/login');
  if (res.status === 404) notFound();
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Backend ${res.status} on ${path}`);
  return data;
}

/** For server actions: resolves to the response body, or `{ error }` to show in the form. */
export async function mutate(path, { method = 'POST', body } = {}) {
  let res;
  try {
    res = await request(path, { method, body });
  } catch {
    return { error: 'The backend is not reachable. Try again in a moment.' };
  }
  if (res.status === 401) redirect('/login');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || `Something went wrong (${res.status}).` };
  return { ok: true, ...data };
}
