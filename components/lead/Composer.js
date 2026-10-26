'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { BTN_PRIMARY, FIELD, LABEL, TEXTAREA } from '../ui/styles';
import { addNote, sendReply } from '@/app/(dash)/leads/actions';

const TABS = [
  { key: 'note', label: 'Note', icon: 'note', placeholder: 'Add an internal note…' },
  { key: 'call', label: 'Call', icon: 'phone', placeholder: 'What was discussed on the call?' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', placeholder: 'Summary of the WhatsApp conversation…' },
  { key: 'meeting', label: 'Meeting', icon: 'leads', placeholder: 'Meeting notes…' },
  { key: 'email', label: 'Email', icon: 'mail' },
];

function Result({ state }) {
  if (state?.error) return <span role="alert" className="text-[12.5px] text-bad">{state.error}</span>;
  if (state?.ok) return <span role="status" className="text-[12.5px] font-medium text-good">Done</span>;
  return null;
}

/** Log a note / call / WhatsApp / meeting, or email the lead over SMTP. */
export default function Composer({ lead, user, emailReady, signature }) {
  const [tab, setTab] = useState('note');
  const [noteState, noteAction, notePending] = useActionState(addNote.bind(null, lead.id), null);
  const [mailState, mailAction, mailPending] = useActionState(sendReply.bind(null, lead.id), null);
  const noteForm = useRef(null);
  const mailForm = useRef(null);
  useEffect(() => {
    if (noteState?.ok) noteForm.current?.reset();
  }, [noteState]);
  useEffect(() => {
    if (mailState?.ok) mailForm.current?.reset();
  }, [mailState]);

  const first = lead.name.split(/\s+/)[0];
  const current = TABS.find((t) => t.key === tab);
  const canEmail = Boolean(lead.email) && emailReady;

  return (
    <div className="rounded-[12px] border border-line bg-surface">
      <div role="tablist" className="flex overflow-x-auto border-b border-line px-[8px]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px flex cursor-pointer items-center gap-[6px] border-b-2 px-[11px] py-[11px] text-[13px] font-semibold whitespace-nowrap ${
              tab === t.key ? 'border-brand-ink text-brand-ink' : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'email' ? (
        <form ref={noteForm} action={noteAction} className="flex flex-col gap-[10px] p-[14px]">
          <input type="hidden" name="type" value={tab} />
          <label className="sr-only" htmlFor="c-body">{current.label}</label>
          <textarea id="c-body" name="body" required rows={3} placeholder={current.placeholder} className={TEXTAREA} />
          <div className="flex flex-wrap items-center gap-[12px]">
            <button type="submit" disabled={notePending} className={BTN_PRIMARY}>
              {notePending ? 'Saving…' : tab === 'note' ? 'Add note' : `Log ${current.label === 'WhatsApp' ? 'WhatsApp' : current.label.toLowerCase()}`}
            </button>
            <Result state={noteState} />
            {tab !== 'note' && lead.status === 'new' && <span className="text-[12px] text-ink-muted">Moves the lead to Contacted</span>}
          </div>
        </form>
      ) : !canEmail ? (
        <p className="p-[16px] text-[13px] text-ink-2">
          {!lead.email ? 'This lead has no email address. Add one under Contact details.' : 'Email is not configured yet. Set SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM on tmfs-admin (see Settings).'}
        </p>
      ) : (
        <form ref={mailForm} action={mailAction} className="flex flex-col gap-[10px] p-[14px]">
          <div className="text-[12.5px] text-ink-2">
            To <span className="font-semibold text-ink">{lead.email}</span>
          </div>
          <div>
            <label className={LABEL} htmlFor="m-subject">Subject</label>
            <input id="m-subject" name="subject" required defaultValue={`Your enquiry${lead.service ? `: ${lead.service}` : ''} | Time Machine Financial Services`} className={FIELD} />
          </div>
          <div>
            <label className={LABEL} htmlFor="m-body">Message</label>
            <textarea
              id="m-body"
              name="body"
              required
              rows={9}
              defaultValue={`Dear ${first},\n\nThank you for contacting Time Machine Financial Services.\n\n\n\nKind regards,\n${user.name}\n${signature}`}
              className={TEXTAREA}
            />
          </div>
          <div className="flex items-center gap-[12px]">
            <button type="submit" disabled={mailPending} className={BTN_PRIMARY}>
              <Icon name="mail" size={15} /> {mailPending ? 'Sending…' : 'Send email'}
            </button>
            <Result state={mailState} />
          </div>
        </form>
      )}
    </div>
  );
}
