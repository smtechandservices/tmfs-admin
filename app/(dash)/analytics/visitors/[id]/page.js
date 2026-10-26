import Link from 'next/link';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import StatusPill from '@/components/ui/StatusPill';
import Empty from '@/components/ui/Empty';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { EVENT_VERBS } from '@/lib/constants';
import { countryName, dateTime, duration, flag, time } from '@/lib/format';

export const metadata = { title: 'Visitor' };

export default async function VisitorPage({ params }) {
  await requireUser();
  const id = decodeURIComponent((await params).id);
  const { events, leads } = await api(`/api/analytics/visitors/${encodeURIComponent(id)}`);
  const sessions = [];
  for (const e of events) {
    let s = sessions.find((x) => x.id === e.session_id);
    if (!s) sessions.push((s = { id: e.session_id, events: [] }));
    s.events.push(e);
  }
  const latest = events[0];

  return (
    <>
      <Link href="/analytics/sessions" className="mb-[14px] inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-ink-2 hover:text-ink">
        <Icon name="arrowLeft" size={14} /> Visitors
      </Link>
      <PageHeader
        title={latest ? `${flag(latest.country)} Visitor from ${[latest.city, countryName(latest.country)].filter(Boolean).join(', ') || 'unknown location'}` : 'Visitor'}
        subtitle={latest ? `${[latest.device, latest.browser, latest.os].filter(Boolean).join(' · ')} · ${sessions.length} session${sessions.length === 1 ? '' : 's'} · first seen ${dateTime(events.at(-1).ts)}` : 'Anonymous browser id'}
      />
      {leads.length > 0 && (
        <Card title="Enquiries from this browser" className="mb-[14px]" bodyClass="">
          <ul>
            {leads.map((l) => (
              <li key={l.id} className="border-b border-line last:border-b-0">
                <Link href={`/leads/${l.id}`} className="flex items-center justify-between gap-[10px] px-[18px] py-[10px] hover:bg-surface-2">
                  <span className="text-[13px] font-semibold text-ink">{l.name} <span className="font-normal text-ink-muted">· {l.service || 'General'} · {dateTime(l.created_at)}</span></span>
                  <StatusPill status={l.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {sessions.length === 0 && <Card><Empty icon="sessions" title="No events for this visitor" /></Card>}
      <div className="flex flex-col gap-[14px]">
        {sessions.map((s) => {
          const first = s.events.at(-1);
          const engaged = s.events.reduce((t, e) => t + (e.type === 'engagement' ? e.duration_ms || 0 : 0), 0);
          return (
            <Card key={s.id} title={`Session on ${dateTime(first.ts)}`} subtitle={`${first.source} · ${first.channel}${first.utm_campaign ? ` · ${first.utm_campaign}` : ''} · engaged ${duration(engaged)}`} bodyClass="">
              <ol>
                {[...s.events].reverse().map((e, i) => (
                  <li key={i} className="flex items-center gap-[12px] border-b border-line px-[18px] py-[8px] text-[13px] last:border-b-0">
                    <span className="tabular w-[44px] flex-none text-[12px] text-ink-muted">{time(e.ts)}</span>
                    <span className="w-[86px] flex-none text-[11.5px] font-semibold text-ink-2">{EVENT_VERBS[e.type] || e.type}</span>
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {e.type === 'click' ? `${e.name} on ${e.path}` : e.type === 'engagement' ? `${e.path} for ${duration(e.duration_ms)}` : e.path}
                      {e.type === 'pageview' && e.title && <span className="text-ink-muted"> · {e.title}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          );
        })}
      </div>
    </>
  );
}
