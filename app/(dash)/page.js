import Link from 'next/link';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import RangeTabs from '@/components/ui/RangeTabs';
import StatTile from '@/components/ui/StatTile';
import StatusPill from '@/components/ui/StatusPill';
import Empty from '@/components/ui/Empty';
import TimeChart from '@/components/charts/TimeChart';
import BarList from '@/components/charts/BarList';
import LiveCard from '@/components/LiveCard';
import LeadsTable from '@/components/LeadsTable';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { STATUSES } from '@/lib/constants';
import { ago, compact, duration, num, pct } from '@/lib/format';

export const metadata = { title: 'Dashboard' };

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Dubai' }).format(new Date()));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default async function Dashboard({ searchParams }) {
  const user = await requireUser();
  const { range: rangeKey } = await searchParams;
  const d = await api('/api/dashboard', { query: { range: rangeKey } });
  const { range: r, overview: ov, series, live: liveNow, pipeline: pipe, recent, due, pages, channels, services, responseTime: rt, siteUrl } = d;
  const c = ov.current;
  const p = ov.previous;
  const pipeRows = STATUSES.filter((s) => s.key !== 'spam').map((s) => ({ ...s, n: pipe.find((x) => x.status === s.key)?.n ?? 0 }));
  const pipeMax = Math.max(1, ...pipeRows.map((x) => x.n));

  return (
    <>
      <PageHeader title={`${greeting()}, ${user.name.split(' ')[0]}`} subtitle={`Website and pipeline for ${r.label.toLowerCase()}`}>
        <RangeTabs current={r.key} path="/" />
      </PageHeader>

      <div className="grid grid-cols-6 gap-[14px] max-xl:grid-cols-3 max-sm:grid-cols-2">
        <StatTile label="Visitors" value={compact(c.visitors)} current={c.visitors} previous={p.visitors} />
        <StatTile label="Page views" value={compact(c.pageviews)} current={c.pageviews} previous={p.pageviews} />
        <StatTile label="Leads" value={num(c.leads)} current={c.leads} previous={p.leads} />
        <StatTile label="Conversion rate" value={pct(c.conversion, 2)} current={c.conversion} previous={p.conversion} />
        <StatTile label="Bounce rate" value={pct(c.bounce_rate, 0)} current={c.bounce_rate} previous={p.bounce_rate} upIsGood={false} />
        <StatTile
          label="Median first response"
          value={rt?.median_s ? duration(rt.median_s * 1000) : '–'}
          hint={rt?.n ? `across ${rt.n} lead${rt.n === 1 ? '' : 's'}` : 'no responses logged'}
        />
      </div>

      <div className="mt-[14px] grid grid-cols-3 gap-[14px] max-xl:grid-cols-1">
        <Card title="Website traffic" subtitle="Unique visitors and page views" className="col-span-2 max-xl:col-span-1">
          <TimeChart
            data={series}
            unit={r.unit}
            series={[
              { key: 'visitors', label: 'Visitors', color: 'var(--series-1)' },
              { key: 'pageviews', label: 'Page views', color: 'var(--series-2)' },
            ]}
          />
        </Card>
        <LiveCard initial={liveNow} siteUrl={siteUrl} />
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-[14px] max-xl:grid-cols-1">
        <Card title="New leads" subtitle={`${num(c.leads)} in ${r.label.toLowerCase()}`}>
          <TimeChart data={series} unit={r.unit} type="column" height={200} series={[{ key: 'leads', label: 'Leads', color: 'var(--series-1)' }]} />
        </Card>
        <Card title="Pipeline" subtitle="All leads by current status" action={<Link href="/leads?view=board" className="text-[12.5px] font-semibold text-brand-ink hover:underline">Open board</Link>}>
          <ul className="flex flex-col gap-[10px]">
            {pipeRows.map((s) => (
              <li key={s.key}>
                <Link href={`/leads?status=${s.key}`} className="group grid grid-cols-[130px_minmax(0,1fr)_44px] items-center gap-[12px] text-[13px]">
                  <span className="flex items-center gap-[8px] text-ink group-hover:text-brand-ink">
                    <span className="h-[8px] w-[8px] rounded-full" style={{ background: s.dot }} />
                    {s.label}
                  </span>
                  <span className="h-[14px] rounded-r-[4px] bg-surface-2">
                    <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(s.n ? 2 : 0, (s.n / pipeMax) * 100)}%`, background: 'var(--series-1)' }} />
                  </span>
                  <span className="tabular text-right font-semibold text-ink">{num(s.n)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-[14px] grid grid-cols-3 gap-[14px] max-xl:grid-cols-1">
        <Card title="Latest leads" className="col-span-2 max-xl:col-span-1" bodyClass="" action={<Link href="/leads" className="text-[12.5px] font-semibold text-brand-ink hover:underline">All leads</Link>}>
          <LeadsTable leads={recent} compact empty="No leads yet" />
        </Card>
        <Card title="Follow-ups due" subtitle="Overdue or due in the next 24 hours" bodyClass="">
          {due.length === 0 ? (
            <Empty icon="check" title="You're all caught up" />
          ) : (
            <ul>
              {due.map((l) => {
                const overdue = new Date(l.follow_up_at) < new Date();
                return (
                  <li key={l.id} className="border-b border-line last:border-b-0">
                    <Link href={`/leads/${l.id}`} className="flex items-center justify-between gap-[10px] px-[18px] py-[11px] hover:bg-surface-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-ink">{l.name}</span>
                        <span className="block truncate text-[12px] text-ink-muted">{l.assignee_name || 'Unassigned'}</span>
                      </span>
                      <span className="flex flex-none flex-col items-end gap-[4px]">
                        <StatusPill status={l.status} />
                        <span className={`text-[11.5px] font-semibold ${overdue ? 'text-bad' : 'text-ink-2'}`}>{overdue ? `Overdue · ${ago(l.follow_up_at)}` : `Due ${ago(l.follow_up_at)}`}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-[14px] grid grid-cols-3 gap-[14px] max-xl:grid-cols-1">
        <Card title="Top pages" action={<Link href={`/analytics?range=${r.key}`} className="text-[12.5px] font-semibold text-brand-ink hover:underline">Analytics</Link>}>
          <BarList rows={pages.map((x) => ({ key: x.path, label: x.path, title: x.title, value: x.views, cols: [num(x.leads)] }))} valueLabel="Views" colLabels={['Leads']} />
        </Card>
        <Card title="Traffic channels">
          <BarList rows={channels.map((x) => ({ key: x.label, label: x.label, value: x.sessions, cols: [num(x.leads)] }))} valueLabel="Sessions" colLabels={['Leads']} />
        </Card>
        <Card title="Leads by service">
          <BarList rows={services.map((x) => ({ key: x.label, label: x.label, href: x.label === 'Not specified' ? undefined : `/leads?service=${encodeURIComponent(x.label)}`, value: x.leads, cols: [num(x.won)] }))} valueLabel="Leads" colLabels={['Won']} emptyIcon="leads" empty="No leads in this period" />
        </Card>
      </div>
    </>
  );
}
