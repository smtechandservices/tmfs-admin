import Link from 'next/link';
import Card from '@/components/ui/Card';
import Empty from '@/components/ui/Empty';
import PageHeader from '@/components/ui/PageHeader';
import RangeTabs from '@/components/ui/RangeTabs';
import { BTN_SECONDARY } from '@/components/ui/styles';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { ago, dateTime, duration, flag } from '@/lib/format';

export const metadata = { title: 'Visitors' };

export default async function SessionsPage({ searchParams }) {
  await requireUser();
  const sp = await searchParams;
  const converted = sp.converted === '1';
  const { range: r, rows: list, more, page } = await api('/api/analytics/sessions', {
    query: { range: sp.range || '7d', converted: converted ? '1' : '', page: sp.page },
  });
  const base = { range: r.key, ...(converted ? { converted: '1' } : {}) };

  return (
    <>
      <PageHeader title="Visitors" subtitle="Recent sessions on the website, newest activity first">
        <div className="flex rounded-[9px] border border-line bg-surface p-[3px]">
          {[
            ['', 'All sessions'],
            ['1', 'Became leads'],
          ].map(([v, label]) => (
            <Link
              key={v}
              href={`/analytics/sessions?${new URLSearchParams({ range: r.key, ...(v ? { converted: v } : {}) })}`}
              className={`rounded-[6px] px-[10px] py-[5px] text-[12.5px] font-semibold ${converted === (v === '1') ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-2'}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <RangeTabs current={r.key} path="/analytics/sessions" params={converted ? { converted: '1' } : {}} />
      </PageHeader>
      <Card bodyClass="">
        {list.length === 0 ? (
          <Empty icon="sessions" title="No sessions in this period" />
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11.5px] text-ink-muted">
                  <th className="py-[8px] pr-[12px] pl-[18px] font-medium">Last active</th>
                  <th className="px-[12px] py-[8px] font-medium">Landing page</th>
                  <th className="px-[12px] py-[8px] font-medium">Source</th>
                  <th className="px-[12px] py-[8px] text-right font-medium">Pages</th>
                  <th className="px-[12px] py-[8px] text-right font-medium">Engaged</th>
                  <th className="px-[12px] py-[8px] font-medium">Visitor</th>
                  <th className="py-[8px] pr-[18px] pl-[12px] font-medium">Lead</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.session_id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                    <td className="py-[9px] pr-[12px] pl-[18px] whitespace-nowrap text-ink-2" title={dateTime(s.last_at)}>{ago(s.last_at)}</td>
                    <td className="max-w-[240px] truncate px-[12px] py-[9px] text-ink">{s.entry || '–'}</td>
                    <td className="max-w-[200px] px-[12px] py-[9px]">
                      <span className="block truncate text-ink-2">{s.source}</span>
                      <span className="block truncate text-[12px] text-ink-muted">{[s.channel, s.campaign].filter(Boolean).join(' · ')}</span>
                    </td>
                    <td className="tabular px-[12px] py-[9px] text-right text-ink">{s.pages}</td>
                    <td className="tabular px-[12px] py-[9px] text-right text-ink-2">{duration(s.engaged_ms)}</td>
                    <td className="px-[12px] py-[9px]">
                      <Link href={`/analytics/visitors/${encodeURIComponent(s.visitor_id)}`} className="block text-ink hover:text-brand-ink hover:underline">
                        {flag(s.country)} {[s.city, s.country].filter(Boolean).join(', ') || 'Unknown'}
                      </Link>
                      <span className="block text-[12px] text-ink-muted">{[s.device, s.browser].filter(Boolean).join(' · ')}</span>
                    </td>
                    <td className="py-[9px] pr-[18px] pl-[12px]">
                      {s.lead_id ? <Link href={`/leads/${s.lead_id}`} className="font-semibold text-brand-ink hover:underline">{s.lead_name}</Link> : <span className="text-ink-muted">–</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(page > 1 || more) && (
          <div className="flex justify-end gap-[8px] border-t border-line px-[18px] py-[11px]">
            {page > 1 && <Link href={`/analytics/sessions?${new URLSearchParams({ ...base, page: page - 1 })}`} className={BTN_SECONDARY}>Previous</Link>}
            {more && <Link href={`/analytics/sessions?${new URLSearchParams({ ...base, page: page + 1 })}`} className={BTN_SECONDARY}>Next</Link>}
          </div>
        )}
      </Card>
    </>
  );
}
