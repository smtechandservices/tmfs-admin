import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import { AddUserForm, CopyField, PasswordForm, RemoveMember } from '@/components/SettingsForms';
import { BTN_GHOST, FIELD } from '@/components/ui/styles';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { mailFrom, verifyMail } from '@/lib/mail';
import { ago, dateTime } from '@/lib/format';
import { updateUser } from './actions';

export const metadata = { title: 'Settings' };

function Status({ ok, warn, children, detail, label }) {
  const color = ok ? 'var(--status-good)' : warn ? 'var(--status-warning)' : 'var(--status-critical)';
  return (
    <li className="flex items-start gap-[10px] border-b border-line py-[10px] last:border-b-0">
      <span className="mt-[1px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-white" style={{ background: color }}>
        <Icon name={ok ? 'check' : warn ? 'alert' : 'x'} size={11} stroke={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink">{children}</span>
        {detail && <span className="block text-[12.5px] leading-[1.5] text-ink-muted">{detail}</span>}
      </span>
      <span className="flex-none text-[12px] font-semibold text-ink-2">{label || (ok ? 'Connected' : warn ? 'Optional' : 'Not set')}</span>
    </li>
  );
}

export default async function SettingsPage() {
  const me = await requireUser();
  const [st, { users }, smtp] = await Promise.all([api('/api/status'), me.role === 'admin' ? api('/api/users') : { users: [] }, verifyMail()]);
  const origin = st.backendUrl;
  const siteUrl = st.siteUrl.replace(/\/$/, '');
  const postgres = st.database === 'postgresql';

  return (
    <>
      <PageHeader title="Settings" subtitle="Connection with the website, integrations and team" />

      <div className="grid grid-cols-2 gap-[14px] max-xl:grid-cols-1">
        <Card title="Website connection" subtitle="Environment variables to set on the tmfs Vercel project. They point at tmfs-backend">
          <div className="flex flex-col gap-[12px] text-[13px]">
            <div>
              <div className="mb-[5px] font-mono text-[12px] font-semibold text-ink-2">ADMIN_URL</div>
              <CopyField value={origin} />
            </div>
            <div>
              <div className="mb-[5px] font-mono text-[12px] font-semibold text-ink-2">ADMIN_INGEST_KEY</div>
              {!st.ingestKeySet ? (
                <p className="text-bad">Set INGEST_KEY on tmfs-backend first (any long random string), then copy it here.</p>
              ) : st.ingestKey ? (
                <CopyField value={st.ingestKey} secret />
              ) : (
                <p className="text-ink-muted">Set. Only admins can reveal it.</p>
              )}
            </div>
            <ul className="mt-[4px]">
              <Status ok={Boolean(st.lastEvent)} warn={!st.lastEvent && st.ingestKeySet} detail={st.lastEvent ? `Last event ${ago(st.lastEvent)} (${dateTime(st.lastEvent)})` : 'No page views received yet.'}>
                Analytics events
              </Status>
              <Status ok={Boolean(st.lastLead)} warn={!st.lastLead && st.ingestKeySet} detail={st.lastLead ? `Last website lead ${ago(st.lastLead)}` : 'No website enquiries received yet.'}>
                Website enquiries
              </Status>
            </ul>
            <div className="rounded-[8px] bg-surface-2 px-[12px] py-[10px] text-[12.5px] leading-[1.55] text-ink-2">
              <b className="text-ink">Exclude your own visits:</b> open <a className="font-semibold break-all text-brand-ink hover:underline" href={`${siteUrl}/?tm_ignore=1`} target="_blank" rel="noopener">{siteUrl}/?tm_ignore=1</a> once on each staff browser. Use <code>?tm_ignore=0</code> to undo.
            </div>
          </div>
        </Card>

        <Card title="Integrations">
          <ul className="-my-[6px]">
            <Status ok={Boolean(st.backendUrl)} detail={`tmfs-backend (Django) at ${origin}`}>Backend</Status>
            <Status ok={postgres} warn={!postgres} detail={postgres ? 'DATABASE_URL' : 'Using the local SQLite file. Set DATABASE_URL (Neon / Supabase) on tmfs-backend before deploying.'}>
              Database · {postgres ? 'Postgres' : `${st.database} (local)`}
            </Status>
            <Status ok={st.authSecret} detail="AUTH_SECRET on tmfs-backend signs login tokens.">Session secret</Status>
            <Status
              ok={smtp?.ok}
              label={smtp && !smtp.ok ? 'Error' : undefined}
              detail={
                !smtp
                  ? 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and MAIL_FROM on tmfs-admin. The website needs the same SMTP settings for enquiry alerts.'
                  : smtp.ok
                    ? `Signed in to ${process.env.SMTP_HOST} · sending as ${mailFrom()}`
                    : `Could not sign in to ${process.env.SMTP_HOST}: ${smtp.error}`
              }
            >
              Email (SMTP)
            </Status>
          </ul>
        </Card>
      </div>

      {me.role === 'admin' && (
        <Card title="Team" subtitle="Admins manage the team and can delete leads; agents work leads" className="mt-[14px]" bodyClass="">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11.5px] text-ink-muted">
                  <th className="py-[8px] pr-[12px] pl-[18px] font-medium">Member</th>
                  <th className="px-[12px] py-[8px] font-medium">Role</th>
                  <th className="px-[12px] py-[8px] font-medium">Last sign-in</th>
                  <th className="py-[8px] pr-[18px] pl-[12px] text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={`border-b border-line ${u.active ? '' : 'opacity-60'}`}>
                    <td className="py-[10px] pr-[12px] pl-[18px]">
                      <span className="block font-semibold text-ink">{u.name}{u.id === me.id ? ' (you)' : ''}</span>
                      <span className="block text-[12px] text-ink-muted">{u.email}{u.active ? '' : ' · deactivated'}</span>
                    </td>
                    <td className="px-[12px] py-[10px] text-ink-2 capitalize">{u.role}</td>
                    <td className="px-[12px] py-[10px] text-ink-2">{u.last_login_at ? ago(u.last_login_at) : 'Never'}</td>
                    <td className="py-[10px] pr-[18px] pl-[12px]">
                      {u.id !== me.id && (
                        <div className="flex flex-wrap items-center justify-end gap-[6px]">
                          <form action={updateUser.bind(null, u.id)} className="flex items-center gap-[6px]">
                            <input type="hidden" name="op" value="password" />
                            <label className="sr-only" htmlFor={`pw-${u.id}`}>New password for {u.name}</label>
                            <input id={`pw-${u.id}`} name="password" type="text" minLength={10} required placeholder="New password" autoComplete="off" className={`${FIELD} h-[30px] w-[150px] text-[12px]`} />
                            <button type="submit" className={`${BTN_GHOST} h-[30px] px-[10px] text-[12px]`}>Reset</button>
                          </form>
                          <form action={updateUser.bind(null, u.id)}>
                            <input type="hidden" name="op" value="role" />
                            <button type="submit" className={`${BTN_GHOST} h-[30px] px-[10px] text-[12px]`}>Make {u.role === 'admin' ? 'agent' : 'admin'}</button>
                          </form>
                          <form action={updateUser.bind(null, u.id)}>
                            <input type="hidden" name="op" value={u.active ? 'deactivate' : 'activate'} />
                            <button type="submit" className={`${BTN_GHOST} h-[30px] px-[10px] text-[12px] ${u.active ? 'text-bad' : ''}`}>{u.active ? 'Deactivate' : 'Reactivate'}</button>
                          </form>
                          {u.role === 'agent' && <RemoveMember id={u.id} name={u.name} />}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-[18px] py-[16px]">
            <AddUserForm />
          </div>
        </Card>
      )}

      <Card title="Your account" subtitle={`${me.name} · ${me.email}`} className="mt-[14px] max-w-[480px]">
        <PasswordForm />
      </Card>
    </>
  );
}
