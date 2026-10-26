'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api, mutate } from '@/lib/api';
import { mailConfigured, mailFrom, sendMail } from '@/lib/mail';

// Form posts are forwarded to tmfs-backend as JSON; it validates them and
// writes the activity timeline. Datetime-local values are sent as-is and read
// as Dubai time there.

const fields = (fd, keys) => Object.fromEntries(keys.map((k) => [k, fd.get(k) ?? '']));

export async function createLeadAction(_state, fd) {
  const res = await mutate('/api/leads', {
    body: fields(fd, ['name', 'company', 'email', 'phone', 'service', 'message', 'origin', 'value_aed', 'assigned_to', 'follow_up_at']),
  });
  if (res.error) return res;
  revalidatePath('/leads');
  redirect(`/leads/${res.id}`);
}

export async function setStatus(leadId, status) {
  await mutate(`/api/leads/${Number(leadId)}/status`, { body: { status } });
  revalidatePath('/leads');
  revalidatePath(`/leads/${leadId}`);
}

export async function updateLead(leadId, _state, fd) {
  const res = await mutate(`/api/leads/${Number(leadId)}`, {
    method: 'PATCH',
    body: fields(fd, ['status', 'priority', 'assigned_to', 'value_aed', 'follow_up_at', 'tags', 'name', 'company', 'email', 'phone', 'service']),
  });
  if (res.error) return res;
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/leads');
  return { ok: true, at: Date.now() };
}

export async function addNote(leadId, _state, fd) {
  const res = await mutate(`/api/leads/${Number(leadId)}/notes`, { body: fields(fd, ['type', 'body']) });
  if (res.error) return res;
  revalidatePath(`/leads/${leadId}`);
  return { ok: true, at: Date.now() };
}

/** Emails the lead over SMTP, then logs it (sent or failed) on the backend. */
export async function sendReply(leadId, _state, fd) {
  const { subject, body } = fields(fd, ['subject', 'body']);
  if (!subject.trim() || !body.trim()) return { error: 'Subject and message are required.' };
  if (!mailConfigured()) return { error: 'Email is not configured. Set SMTP_HOST and MAIL_FROM on tmfs-admin (see Settings).' };
  const { lead } = await api(`/api/leads/${Number(leadId)}`);
  if (!lead.email) return { error: 'This lead has no email address.' };

  const log = { subject, body, from_addr: mailFrom(), to_addr: lead.email };
  let sendError = null;
  try {
    log.message_id = await sendMail({ to: lead.email, subject, text: body });
    log.status = 'sent';
  } catch (err) {
    sendError = err.message || 'SMTP error';
    Object.assign(log, { status: 'failed', error: sendError });
  }
  const res = await mutate(`/api/leads/${Number(leadId)}/emails`, { body: log });
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/inbox');
  if (sendError) return { error: `Could not send: ${sendError}` };
  if (res.error) return { error: `Sent, but it could not be logged: ${res.error}` };
  return { ok: true, at: Date.now() };
}

export async function deleteLead(leadId) {
  const res = await mutate(`/api/leads/${Number(leadId)}`, { method: 'DELETE' });
  if (res.error) return;
  revalidatePath('/leads');
  redirect('/leads');
}
