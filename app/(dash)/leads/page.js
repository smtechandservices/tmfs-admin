import Link from 'next/link';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Icon from '@/components/ui/Icon';
import FilterBar from '@/components/FilterBar';
import LeadsTable from '@/components/LeadsTable';
import LeadBoard from '@/components/LeadBoard';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/styles';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { CHANNELS, SERVICES, STATUSES } from '@/lib/constants';
import { num } from '@/lib/format';

export const metadata = { title: 'Leads' };

const KEYS = ['q', 'status', 'service', 'channel', 'assignee', 'sort', 'due', 'from', 'to'];

export default async function LeadsPage({ searchParams }) {
  const user = await requireUser();
  const sp = await searchParams;
  const params = Object.fromEntries(KEYS.map((k) => [k, sp[k] || '']).filter(([, v]) => v));
  const view = sp.view === 'board' ? 'board' : 'list';
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ users }, { rows, total, pageSize: PAGE, services }] = await Promise.all([
    api('/api/team'),
    api('/api/leads', { query: { ...params, view, page } }),
  ]);
  const qs = (extra) => new URLSearchParams({ ...params, ...(view === 'board' ? { view } : {}), ...extra }).toString();
  const serviceOptions = [...new Set([...SERVICES, ...services])];

  return (
    <>
      <PageHeader title="Leads" subtitle={`${num(total)} ${total === 1 ? 'lead' : 'leads'}${params.status || params.q || params.service ? ' match these filters' : ''}`}>
        <div className="flex rounded-[9px] border border-line bg-surface p-[3px]">
          {[
            ['list', 'List', 'list'],
            ['board', 'Board', 'board'],
          ].map(([key, label, icon]) => (
            <Link
              key={key}
              href={`/leads?${new URLSearchParams({ ...params, ...(key === 'board' ? { view: 'board' } : {}) })}`}
              aria-current={view === key ? 'true' : undefined}
              className={`flex items-center gap-[6px] rounded-[6px] px-[10px] py-[5px] text-[12.5px] font-semibold ${view === key ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-2'}`}
            >
              <Icon name={icon} size={14} />
              {label}
            </Link>
          ))}
        </div>
        <a href={`/leads/export?${new URLSearchParams(params)}`} className={BTN_SECONDARY}>
          <Icon name="download" size={15} /> Export CSV
        </a>
        <Link href="/leads/new" className={BTN_PRIMARY}>
          <Icon name="plus" size={15} stroke={2.2} /> New lead
        </Link>
      </PageHeader>

      <div className="mb-[14px]">
        <FilterBar
          action="/leads"
          values={params}
          hidden={{ view: view === 'board' ? 'board' : '' }}
          search="Search name, email, phone, company or message"
          fields={[
            { name: 'status', label: 'Status', options: [['', 'All statuses'], ['open', 'Open (not won/lost)'], ...STATUSES.map((s) => [s.key, s.label])] },
            { name: 'service', label: 'Service', options: [['', 'All services'], ...serviceOptions.map((s) => [s, s])] },
            { name: 'channel', label: 'Channel', options: [['', 'All channels'], ...CHANNELS.map((c) => [c, c])] },
            { name: 'assignee', label: 'Owner', options: [['', 'Any owner'], [String(user.id), 'Mine'], ['none', 'Unassigned'], ...users.filter((u) => u.id !== user.id).map((u) => [String(u.id), u.name])] },
            { name: 'sort', label: 'Sort', options: [['', 'Newest first'], ['oldest', 'Oldest first'], ['activity', 'Recent activity'], ['followup', 'Follow-up date'], ['value', 'Deal value']] },
          ]}
        />
      </div>

      {view === 'board' ? (
        <LeadBoard leads={rows} />
      ) : (
        <Card bodyClass="">
          <LeadsTable leads={rows} />
          {total > PAGE && (
            <div className="flex items-center justify-between border-t border-line px-[18px] py-[11px] text-[12.5px] text-ink-2">
              <span>
                {num((page - 1) * PAGE + 1)}–{num(Math.min(total, page * PAGE))} of {num(total)}
              </span>
              <span className="flex gap-[8px]">
                {page > 1 && <Link href={`/leads?${qs({ page: page - 1 })}`} className={BTN_SECONDARY}>Previous</Link>}
                {page * PAGE < total && <Link href={`/leads?${qs({ page: page + 1 })}`} className={BTN_SECONDARY}>Next</Link>}
              </span>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
