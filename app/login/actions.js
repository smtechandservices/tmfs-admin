'use server';

import { redirect } from 'next/navigation';
import { request } from '@/lib/api';
import { endSession, startSession } from '@/lib/auth';

export async function login(_state, formData) {
  let res;
  try {
    res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: formData.get('email'), password: formData.get('password') },
      token: null,
    });
  } catch {
    return { error: 'The backend is not reachable. Check that tmfs-backend is running.' };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || `Could not sign in (${res.status}).` };
  await startSession(data.token);
  const next = String(formData.get('next') || '/');
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/');
}

export async function logout() {
  await endSession();
  redirect('/login');
}
