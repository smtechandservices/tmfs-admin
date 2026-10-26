'use server';

import { revalidatePath } from 'next/cache';
import { mutate } from '@/lib/api';
import { startSession } from '@/lib/auth';

export async function addUser(_state, fd) {
  const res = await mutate('/api/users', {
    body: { name: fd.get('name'), email: fd.get('email'), password: fd.get('password'), role: fd.get('role') },
  });
  if (res.error) return res;
  revalidatePath('/settings');
  return { ok: true, at: Date.now() };
}

export async function updateUser(userId, fd) {
  await mutate(`/api/users/${Number(userId)}`, { body: { op: fd.get('op'), password: fd.get('password') } });
  revalidatePath('/settings');
}

export async function changePassword(_state, fd) {
  const res = await mutate('/api/auth/password', { body: { current: fd.get('current'), next: fd.get('next') } });
  if (res.error) return res;
  // The password is part of the token signature; keep this browser signed in.
  await startSession(res.token);
  return { ok: true, at: Date.now() };
}
