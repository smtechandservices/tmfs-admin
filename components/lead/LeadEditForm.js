'use client';

import { useActionState, useEffect, useState } from 'react';
import { BTN_PRIMARY, FIELD, LABEL } from '../ui/styles';
import { PRIORITIES, SERVICES, STATUSES } from '@/lib/constants';
import { toLocalInput } from '@/lib/format';
import { updateLead } from '@/app/(dash)/leads/actions';

export default function LeadEditForm({ lead, users }) {
  const [state, action, pending] = useActionState(updateLead.bind(null, lead.id), null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!state?.ok) return;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [state]);
  const services = SERVICES.includes(lead.service) || !lead.service ? SERVICES : [lead.service, ...SERVICES];

  return (
    <form action={action} className="flex flex-col gap-[12px]">
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label className={LABEL} htmlFor="f-status">Status</label>
          <select id="f-status" name="status" defaultValue={lead.status} className={`${FIELD} cursor-pointer`}>
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="f-priority">Priority</label>
          <select id="f-priority" name="priority" defaultValue={lead.priority} className={`${FIELD} cursor-pointer`}>
            {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL} htmlFor="f-owner">Owner</label>
        <select id="f-owner" name="assigned_to" defaultValue={lead.assigned_to ?? ''} className={`${FIELD} cursor-pointer`}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label className={LABEL} htmlFor="f-value">Deal value (AED)</label>
          <input id="f-value" name="value_aed" type="number" min="0" step="1" inputMode="numeric" defaultValue={lead.value_aed ?? ''} placeholder="0" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="f-follow">Follow-up</label>
          <input id="f-follow" name="follow_up_at" type="datetime-local" defaultValue={toLocalInput(lead.follow_up_at)} className={FIELD} />
        </div>
      </div>
      <div>
        <label className={LABEL} htmlFor="f-tags">Tags</label>
        <input id="f-tags" name="tags" defaultValue={(lead.tags || []).join(', ')} placeholder="golden-visa, referral" className={FIELD} />
      </div>

      <details className="rounded-[8px] border border-line px-[12px] py-[8px]">
        <summary className="cursor-pointer text-[12.5px] font-semibold text-ink-2 select-none">Contact details</summary>
        <div className="mt-[10px] flex flex-col gap-[10px] pb-[4px]">
          {[
            ['name', 'Name', 'text', lead.name],
            ['company', 'Company', 'text', lead.company],
            ['email', 'Email', 'email', lead.email],
            ['phone', 'Mobile', 'tel', lead.phone],
          ].map(([name, label, type, value]) => (
            <div key={name}>
              <label className={LABEL} htmlFor={`f-${name}`}>{label}</label>
              <input id={`f-${name}`} name={name} type={type} defaultValue={value ?? ''} required={name === 'name'} className={FIELD} />
            </div>
          ))}
          <div>
            <label className={LABEL} htmlFor="f-service">Service</label>
            <select id="f-service" name="service" defaultValue={lead.service ?? ''} className={`${FIELD} cursor-pointer`}>
              <option value="">Not specified</option>
              {services.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </details>

      <div className="flex items-center gap-[12px]">
        <button type="submit" disabled={pending} className={BTN_PRIMARY}>{pending ? 'Saving…' : 'Save changes'}</button>
        <span role="status" className="text-[12.5px] font-medium text-good">{saved ? 'Saved' : ''}</span>
        {state?.error && <span role="alert" className="text-[12.5px] text-bad">{state.error}</span>}
      </div>
    </form>
  );
}
