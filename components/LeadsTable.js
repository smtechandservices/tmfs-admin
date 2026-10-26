import Link from 'next/link';
import StatusPill from './ui/StatusPill';
import Empty from './ui/Empty';
import { ago, dateTime } from '@/lib/format';

export default function LeadsTable({ leads, compact = false, empty = 'No leads match these filters' }) {
  if (!leads.length) return <Empty icon="leads" title={empty} />;
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line text-[11.5px] font-medium text-ink-muted">
            <th className="py-[8px] pr-[12px] pl-[18px] font-medium">Lead</th>
            <th className="px-[12px] py-[8px] font-medium">Service</th>
            {!compact && <th className="px-[12px] py-[8px] font-medium">Source</th>}
            <th className="px-[12px] py-[8px] font-medium">Status</th>
            {!compact && <th className="px-[12px] py-[8px] font-medium">Owner</th>}
            <th className="py-[8px] pr-[18px] pl-[12px] text-right font-medium">Received</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="group border-b border-line last:border-b-0 hover:bg-surface-2">
              <td className="py-[10px] pr-[12px] pl-[18px]">
                <Link href={`/leads/${l.id}`} className="block min-w-0">
                  <span className="block truncate font-semibold text-ink group-hover:text-brand-ink">{l.name}</span>
                  <span className="block truncate text-[12px] text-ink-muted">{[l.company, l.email || l.phone].filter(Boolean).join(' · ')}</span>
                </Link>
              </td>
              <td className="max-w-[180px] truncate px-[12px] py-[10px] text-ink-2">{l.service || '–'}</td>
              {!compact && (
                <td className="max-w-[200px] px-[12px] py-[10px]">
                  <span className="block truncate text-ink-2">{l.channel || l.origin}</span>
                  {l.source_page && <span className="block truncate text-[12px] text-ink-muted">{l.source_page}</span>}
                </td>
              )}
              <td className="px-[12px] py-[10px]"><StatusPill status={l.status} /></td>
              {!compact && <td className="px-[12px] py-[10px] text-ink-2">{l.assignee_name || <span className="text-ink-muted">Unassigned</span>}</td>}
              <td className="py-[10px] pr-[18px] pl-[12px] text-right whitespace-nowrap text-ink-2" title={dateTime(l.created_at)}>{ago(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
