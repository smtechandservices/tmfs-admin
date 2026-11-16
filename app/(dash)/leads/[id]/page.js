import Link from 'next/link';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import StatusPill from '@/components/ui/StatusPill';
import LeadEditForm from '@/components/lead/LeadEditForm';
import Composer from '@/components/lead/Composer';
import Timeline from '@/components/lead/Timeline';
import DeleteLead from '@/components/lead/DeleteLead';
import { BTN_SECONDARY } from '@/components/ui/styles';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { mailConfigured } from '@/lib/mail';
import { EVENT_VERBS, ORIGINS } from '@/lib/constants';
import { aed, ago, countryName, dateTime, duration, flag, waLink } from '@/lib/format';

const loadLead = (id) => api(`/api/leads/${Number(id) || 0}`);

export async function generateMetadata({ params }) {
  const { lead } = await loadLead((await params).id);
  return { title: lead.name };
}

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-[10px] border-b border-line py-[8px] text-[13px] last:border-b-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

export default async function LeadPage({ params }) {
  const user = await requireUser();
  const [{ lead, timeline, related, journey, siteUrl }, { users }] = await Promise.all([loadLead((await params).id), api('/api/team')]);
  const wa = waLink(lead.phone);
  const pageviews = journey.filter((e) => e.type === 'pageview');
  const firstSeen = journey.at(-1)?.ts;

  return (
    <>
      <div className="mb-[14px]">
        <Link href="/leads" className="inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-ink-2 hover:text-ink">
          <Icon name="arrowLeft" size={14} /> Leads
        </Link>
      </div>
      <div className="mb-[20px] flex flex-wrap items-start justify-between gap-[14px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-[10px]">
            <h1 className="font-display text-[24px] font-bold tracking-[-.03em] text-brand-ink">{lead.name}</h1>
            <StatusPill status={lead.status} />
            {lead.priority === 'high' && <span className="rounded-full bg-accent-soft px-[8px] py-[2px] text-[11.5px] font-bold text-bad">High priority</span>}
          </div>
          <p className="mt-[4px] text-[13px] text-ink-muted">
            {[lead.company, lead.service, `Received ${dateTime(lead.created_at)} (${ago(lead.created_at)})`].filter(Boolean).join(' · ')}
          </p>
          {lead.tags?.length > 0 && (
            <div className="mt-[8px] flex flex-wrap gap-[6px]">
              {lead.tags.map((t) => (
                <span key={t} className="rounded-[5px] bg-surface-3 px-[7px] py-[2px] text-[11.5px] font-medium text-ink-2">#{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {lead.phone && (
            <a href={`tel:${lead.phone.replace(/\s+/g, '')}`} className={BTN_SECONDARY}><Icon name="phone" size={15} /> Call</a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener" className={BTN_SECONDARY}><Icon name="whatsapp" size={15} /> WhatsApp</a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className={BTN_SECONDARY}><Icon name="mail" size={15} /> Email app</a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-[16px] max-xl:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-[16px]">
          {lead.message && (
            <Card title="Enquiry">
              <p className="text-[14px] leading-[1.65] whitespace-pre-wrap text-ink">{lead.message}</p>
            </Card>
          )}
          <Composer
            lead={lead}
            user={user}
            emailReady={mailConfigured()}
            signature={'Time Machine Financial Services\n+971 58 142 7348 · timemachine.ae'}
          />
          <Card title="Activity" subtitle={`${timeline.length} ${timeline.length === 1 ? 'entry' : 'entries'}, newest first`}>
            <Timeline items={timeline} />
          </Card>
          <Card title="Website journey" subtitle={lead.visitor_id ? `${pageviews.length} page views${firstSeen ? ` since ${dateTime(firstSeen)}` : ''}` : 'No tracking data for this lead'} bodyClass="">
            {journey.length === 0 ? (
              <p className="px-[18px] py-[16px] text-[13px] text-ink-muted">
                {lead.origin === 'website' ? 'This enquiry arrived before tracking was connected, or the visitor blocked it.' : 'Added manually, so there is no website visit to show.'}
              </p>
            ) : (
              <ol className="max-h-[420px] overflow-y-auto">
                {journey.map((e, i) => (
                  <li key={i} className="flex items-center gap-[12px] border-b border-line px-[18px] py-[8px] text-[13px] last:border-b-0">
                    <span className="tabular w-[104px] flex-none text-[12px] text-ink-muted">{dateTime(e.ts)}</span>
                    <span className="w-[86px] flex-none text-[11.5px] font-semibold text-ink-2">{EVENT_VERBS[e.type] || e.type}</span>
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {e.type === 'engagement' ? `${e.path} for ${duration(e.duration_ms)}` : e.type === 'click' ? `${e.name} on ${e.path}` : e.path}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-[16px]">
          <Card title="Manage">
            <LeadEditForm lead={lead} users={users} />
          </Card>
          <Card title="Contact">
            <dl>
              <Row label="Email">{lead.email && <a href={`mailto:${lead.email}`} className="text-brand-ink hover:underline">{lead.email}</a>}</Row>
              <Row label="Mobile">{lead.phone}</Row>
              <Row label="Company">{lead.company}</Row>
              <Row label="Deal value">{lead.value_aed ? aed(lead.value_aed) : null}</Row>
              <Row label="Owner">{lead.assignee_name || 'Unassigned'}</Row>
              <Row label="Follow-up">{lead.follow_up_at ? `${dateTime(lead.follow_up_at)} (${ago(lead.follow_up_at)})` : null}</Row>
            </dl>
          </Card>
          <Card title="Attribution">
            <dl>
              <Row label="Origin">{ORIGINS.find((o) => o.key === lead.origin)?.label || lead.origin}</Row>
              <Row label="Channel">{lead.channel}</Row>
              <Row label="Form page">
                {lead.source_page && <a href={`${siteUrl}${lead.source_page}`} target="_blank" rel="noopener" className="text-brand-ink hover:underline">{lead.source_page}</a>}
              </Row>
              <Row label="Landing page">{lead.landing_page}</Row>
              <Row label="Referrer">{lead.referrer}</Row>
              <Row label="Campaign">{[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ') || null}</Row>
              <Row label="Keyword">{lead.utm_term}</Row>
              <Row label="Location">{lead.country ? `${flag(lead.country)} ${[lead.city, countryName(lead.country)].filter(Boolean).join(', ')}` : null}</Row>
              <Row label="Device">{[lead.device, lead.browser, lead.os].filter(Boolean).join(' · ') || null}</Row>
              <Row label="Visitor">
                {lead.visitor_id && <Link href={`/analytics/visitors/${encodeURIComponent(lead.visitor_id)}`} className="text-brand-ink hover:underline">View all visits</Link>}
              </Row>
            </dl>
          </Card>
          {related.length > 0 && (
            <Card title="Other enquiries" subtitle="Same email, mobile or browser" bodyClass="">
              <ul>
                {related.map((r) => (
                  <li key={r.id} className="border-b border-line last:border-b-0">
                    <Link href={`/leads/${r.id}`} className="flex items-center justify-between gap-[10px] px-[18px] py-[10px] hover:bg-surface-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-ink">{r.service || r.name}</span>
                        <span className="block text-[12px] text-ink-muted">{dateTime(r.created_at)}</span>
                      </span>
                      <StatusPill status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {user.role === 'admin' && (
            <div className="flex justify-end">
              <DeleteLead id={lead.id} name={lead.name} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
