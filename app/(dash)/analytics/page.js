import Link from 'next/link';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import RangeTabs from '@/components/ui/RangeTabs';
import StatTile from '@/components/ui/StatTile';
import Empty from '@/components/ui/Empty';
import TimeChart from '@/components/charts/TimeChart';
import BarList from '@/components/charts/BarList';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { compact, countryName, duration, flag, num, pct } from '@/lib/format';

export const metadata = { title: 'Analytics' };

export default async function AnalyticsPage({ searchParams }) {
  await requireUser();
  const d = await api('/api/analytics', { query: { range: (await searchParams).range } });
  const { range: r, overview: ov, series, pages, entries, channels, sources, campaigns, countries, cities, devices, browsers, oses, clicks: ctas, leadChannels, siteUrl } = d;
  const c = ov.current;
  const p = ov.previous;
  const noData = c.sessions === 0;

  return (
    <>
      <PageHeader title="Website analytics" subtitle={`${siteUrl.replace(/^https?:\/\//, '')} · first-party tracking · ${r.label.toLowerCase()}`}>
        <RangeTabs current={r.key} path="/analytics" />
      </PageHeader>

      <div className="grid grid-cols-6 gap-[14px] max-xl:grid-cols-3 max-sm:grid-cols-2">
        <StatTile label="Visitors" value={compact(c.visitors)} current={c.visitors} previous={p.visitors} />
        <StatTile label="Sessions" value={compact(c.sessions)} current={c.sessions} previous={p.sessions} />
        <StatTile label="Page views" value={compact(c.pageviews)} current={c.pageviews} previous={p.pageviews} />
        <StatTile
          label="Pages per session"
          value={c.sessions ? (c.pageviews / c.sessions).toFixed(1) : '0'}
          current={c.sessions ? c.pageviews / c.sessions : 0}
          previous={p.sessions ? p.pageviews / p.sessions : 0}
        />
        <StatTile label="Avg. engaged time" value={duration(c.avg_engaged_ms)} current={c.avg_engaged_ms} previous={p.avg_engaged_ms} />
        <StatTile label="Bounce rate" value={pct(c.bounce_rate, 0)} current={c.bounce_rate} previous={p.bounce_rate} upIsGood={false} />
      </div>

      {noData && (
        <div className="mt-[14px] rounded-[12px] border border-dashed border-line-strong bg-surface px-[18px] py-[14px] text-[13px] text-ink-2">
          No visits recorded in this period. If the website was just connected, check <Link href="/settings" className="font-semibold text-brand-ink hover:underline">Settings → Connection</Link>.
        </div>
      )}

      <Card title="Traffic" subtitle="Unique visitors and page views" className="mt-[14px]">
        <TimeChart
          data={series}
          unit={r.unit}
          height={260}
          series={[
            { key: 'visitors', label: 'Visitors', color: 'var(--series-1)' },
            { key: 'pageviews', label: 'Page views', color: 'var(--series-2)' },
          ]}
        />
      </Card>

      <div className="mt-[14px] grid grid-cols-3 gap-[14px] max-xl:grid-cols-1">
        <Card title="Channels" subtitle="Sessions and website leads">
          <BarList rows={channels.map((x) => ({ key: x.label, label: x.label, value: x.sessions, cols: [num(x.leads), x.sessions ? pct(x.leads / x.sessions) : '–'] }))} valueLabel="Sessions" colLabels={['Leads', 'Conv.']} />
        </Card>
        <Card title="Sources" subtitle="utm_source or referring site">
          <BarList rows={sources.map((x) => ({ key: x.label, label: x.label, value: x.sessions, cols: [num(x.leads)] }))} valueLabel="Sessions" colLabels={['Leads']} />
        </Card>
        <Card title="Campaigns" subtitle="utm_campaign">
          <BarList rows={campaigns.map((x) => ({ key: x.label, label: x.label, value: x.sessions, cols: [num(x.leads)] }))} valueLabel="Sessions" colLabels={['Leads']} empty="No tagged campaigns. Add ?utm_campaign= to ad links." />
        </Card>
      </div>

      <div className="mt-[14px] grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[14px] max-xl:grid-cols-1">
        <Card title="Pages" subtitle="Views, unique visitors, average time on page and enquiries sent from the page">
          <BarList
            rows={pages.map((x) => ({
              key: x.path,
              label: x.path,
              title: x.title,
              href: `${siteUrl}${x.path}`,
              external: true,
              value: x.views,
              cols: [num(x.visitors), x.avg_ms ? duration(x.avg_ms) : '–', num(x.leads)],
            }))}
            valueLabel="Views"
            colLabels={['Visitors', 'Avg. time', 'Leads']}
          />
        </Card>
        <Card title="Landing pages" subtitle="Where sessions start">
          <BarList rows={entries.map((x) => ({ key: x.path, label: x.path, value: x.sessions, cols: [num(x.leads)] }))} valueLabel="Sessions" colLabels={['Leads']} />
        </Card>
      </div>

      <div className="mt-[14px] grid grid-cols-3 gap-[14px] max-xl:grid-cols-1">
        <Card title="Contact clicks" subtitle="WhatsApp, phone, email, tracked buttons and form starts">
          <BarList rows={ctas.map((x) => ({ key: x.label, label: x.label, value: x.clicks, cols: [num(x.visitors)] }))} valueLabel="Clicks" colLabels={['Visitors']} empty="No tracked clicks yet" />
        </Card>
        <Card title="Countries">
          <BarList rows={countries.map((x) => ({ key: x.label, label: countryName(x.label), prefix: flag(x.label), value: x.visitors }))} valueLabel="Visitors" />
        </Card>
        <Card title="Cities">
          <BarList rows={cities.map((x) => ({ key: x.label, label: x.label, value: x.visitors }))} valueLabel="Visitors" empty="No cities yet. Vercel adds the city once the website is hosted there" />
        </Card>
      </div>

      <div className="mt-[14px] grid grid-cols-3 gap-[14px] max-xl:grid-cols-1">
        <Card title="Devices">
          <BarList rows={devices.map((x) => ({ key: x.label, label: x.label, value: x.visitors, cols: [c.visitors ? pct(x.visitors / c.visitors, 0) : '–'] }))} valueLabel="Visitors" colLabels={['Share']} />
        </Card>
        <Card title="Browsers">
          <BarList rows={browsers.map((x) => ({ key: x.label, label: x.label, value: x.visitors }))} valueLabel="Visitors" />
        </Card>
        <Card title="Operating systems">
          <BarList rows={oses.map((x) => ({ key: x.label, label: x.label, value: x.visitors }))} valueLabel="Visitors" />
        </Card>
      </div>

      <Card title="Leads by channel" subtitle="Every lead in the period, including ones added by hand" className="mt-[14px]">
        {leadChannels.length === 0 ? (
          <Empty icon="leads" title="No leads in this period" />
        ) : (
          <BarList rows={leadChannels.map((x) => ({ key: x.label, label: x.label, value: x.leads, cols: [num(x.won), x.leads ? pct(x.won / x.leads, 0) : '–'] }))} valueLabel="Leads" colLabels={['Won', 'Win rate']} />
        )}
      </Card>
    </>
  );
}
