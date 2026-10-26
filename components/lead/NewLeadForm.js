'use client';

import { useActionState } from 'react';
import { BTN_PRIMARY, FIELD, LABEL, TEXTAREA } from '../ui/styles';
import { ORIGINS, SERVICES } from '@/lib/constants';
import { createLeadAction } from '@/app/(dash)/leads/actions';

export default function NewLeadForm({ users, me }) {
  const [state, action, pending] = useActionState(createLeadAction, null);
  return (
    <form action={action} className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
      <div>
        <label className={LABEL} htmlFor="n-name">Full name *</label>
        <input id="n-name" name="name" required autoFocus className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="n-company">Company</label>
        <input id="n-company" name="company" className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="n-email">Email</label>
        <input id="n-email" name="email" type="email" className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="n-phone">Mobile</label>
        <input id="n-phone" name="phone" type="tel" placeholder="+971 50 000 0000" className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="n-origin">How did they reach us?</label>
        <select id="n-origin" name="origin" defaultValue="phone" className={`${FIELD} cursor-pointer`}>
          {ORIGINS.filter((o) => o.key !== 'website').map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className={LABEL} htmlFor="n-service">Service</label>
        <select id="n-service" name="service" defaultValue="" className={`${FIELD} cursor-pointer`}>
          <option value="">Not specified</option>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className={LABEL} htmlFor="n-owner">Owner</label>
        <select id="n-owner" name="assigned_to" defaultValue={me} className={`${FIELD} cursor-pointer`}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label className={LABEL} htmlFor="n-value">Value (AED)</label>
          <input id="n-value" name="value_aed" type="number" min="0" inputMode="numeric" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="n-follow">Follow-up</label>
          <input id="n-follow" name="follow_up_at" type="datetime-local" className={FIELD} />
        </div>
      </div>
      <div className="col-span-2 max-sm:col-span-1">
        <label className={LABEL} htmlFor="n-message">Requirement</label>
        <textarea id="n-message" name="message" rows={4} placeholder="What do they need?" className={TEXTAREA} />
      </div>
      <div className="col-span-2 flex items-center gap-[12px] max-sm:col-span-1">
        <button type="submit" disabled={pending} className={BTN_PRIMARY}>{pending ? 'Saving…' : 'Create lead'}</button>
        {state?.error && <span role="alert" className="text-[12.5px] text-bad">{state.error}</span>}
      </div>
    </form>
  );
}
