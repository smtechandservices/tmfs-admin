'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY, FIELD, LABEL } from './ui/styles';
import { addUser, changePassword } from '@/app/(dash)/settings/actions';

function Result({ state, ok = 'Saved' }) {
  if (state?.error) return <span role="alert" className="text-[12.5px] text-bad">{state.error}</span>;
  if (state?.ok) return <span role="status" className="text-[12.5px] font-medium text-good">{ok}</span>;
  return null;
}

export function AddUserForm() {
  const [state, action, pending] = useActionState(addUser, null);
  const form = useRef(null);
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} action={action} className="grid grid-cols-[1fr_1fr_1fr_120px_auto] items-end gap-[10px] max-lg:grid-cols-2 max-sm:grid-cols-1">
      <div><label className={LABEL} htmlFor="u-name">Name</label><input id="u-name" name="name" required className={FIELD} /></div>
      <div><label className={LABEL} htmlFor="u-email">Email</label><input id="u-email" name="email" type="email" required className={FIELD} /></div>
      <div><label className={LABEL} htmlFor="u-pass">Temporary password</label><input id="u-pass" name="password" type="text" minLength={10} required autoComplete="off" className={FIELD} /></div>
      <div>
        <label className={LABEL} htmlFor="u-role">Role</label>
        <select id="u-role" name="role" className={`${FIELD} cursor-pointer`}><option value="agent">Agent</option><option value="admin">Admin</option></select>
      </div>
      <div className="flex items-center gap-[10px]">
        <button type="submit" disabled={pending} className={BTN_PRIMARY}>{pending ? 'Adding…' : 'Add member'}</button>
      </div>
      <div className="col-span-full -mt-[2px] min-h-[18px]"><Result state={state} ok="Member added. Share the temporary password with them directly." /></div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const form = useRef(null);
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} action={action} className="flex flex-col gap-[10px]">
      <div><label className={LABEL} htmlFor="p-cur">Current password</label><input id="p-cur" name="current" type="password" required autoComplete="current-password" className={FIELD} /></div>
      <div><label className={LABEL} htmlFor="p-new">New password</label><input id="p-new" name="next" type="password" minLength={10} required autoComplete="new-password" className={FIELD} /></div>
      <div className="flex items-center gap-[10px]">
        <button type="submit" disabled={pending} className={BTN_SECONDARY}>{pending ? 'Saving…' : 'Change password'}</button>
        <Result state={state} ok="Password changed" />
      </div>
    </form>
  );
}

export function CopyField({ value, secret = false }) {
  const [shown, setShown] = useState(!secret);
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 items-center gap-[6px]">
      <code className="min-w-0 flex-1 truncate rounded-[6px] border border-line bg-surface-2 px-[9px] py-[6px] font-mono text-[12px] text-ink">
        {shown ? value : '•'.repeat(Math.min(24, value.length))}
      </code>
      {secret && (
        <button type="button" onClick={() => setShown((s) => !s)} className={`${BTN_SECONDARY} h-[30px] px-[10px] text-[12px]`}>{shown ? 'Hide' : 'Show'}</button>
      )}
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className={`${BTN_SECONDARY} h-[30px] px-[10px] text-[12px]`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
