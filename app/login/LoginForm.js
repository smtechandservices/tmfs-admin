'use client';

import { useActionState } from 'react';
import { login } from './actions';
import { BTN_PRIMARY, FIELD, LABEL } from '@/components/ui/styles';

export default function LoginForm({ next }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex flex-col gap-[14px]">
      <input type="hidden" name="next" value={next || '/'} />
      <div>
        <label htmlFor="email" className={LABEL}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus className={FIELD} />
      </div>
      <div>
        <label htmlFor="password" className={LABEL}>Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={FIELD} />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-[8px] bg-accent-soft px-[11px] py-[8px] text-[13px] text-bad">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className={`${BTN_PRIMARY} mt-[4px] h-[40px] w-full`}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
