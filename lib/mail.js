import 'server-only';
import nodemailer from 'nodemailer';

// CRM email goes out over SMTP from this app's server with nodemailer; the
// backend only keeps the log. Configure:
//   SMTP_HOST, SMTP_PORT  e.g. smtp.office365.com and 587 (465 uses TLS from the start)
//   SMTP_USER, SMTP_PASS  mailbox login (an app password where the provider requires one)
//   MAIL_FROM             e.g. "Time Machine Financial Services <info@timemachine.ae>"
// Client replies land in the MAIL_FROM mailbox.

const env = (k) => (process.env[k] || '').trim();

export const mailFrom = () => env('MAIL_FROM') || env('SMTP_USER');

export const mailConfigured = () => Boolean(env('SMTP_HOST') && mailFrom());

let transport;
function transporter() {
  if (!transport) {
    const port = Number(env('SMTP_PORT')) || 587;
    transport = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: env('SMTP_USER') ? { user: env('SMTP_USER'), pass: env('SMTP_PASS') } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
    });
  }
  return transport;
}

/** Sends a plain-text email; resolves to the SMTP Message-ID. */
export async function sendMail({ to, subject, text }) {
  const info = await transporter().sendMail({ from: mailFrom(), to, subject, text });
  return info.messageId;
}

/** For Settings: null when SMTP isn't configured, otherwise whether login works. */
export async function verifyMail() {
  if (!mailConfigured()) return null;
  try {
    await transporter().verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
