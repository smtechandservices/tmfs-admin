// Pipeline vocabulary shared by the server and the UI.

export const STATUSES = [
  { key: 'new', label: 'New', dot: 'var(--series-1)' },
  { key: 'contacted', label: 'Contacted', dot: 'var(--series-7)' },
  { key: 'qualified', label: 'Qualified', dot: 'var(--series-3)' },
  { key: 'proposal', label: 'Proposal sent', dot: 'var(--series-4)' },
  { key: 'won', label: 'Won', dot: 'var(--status-good)' },
  { key: 'lost', label: 'Lost', dot: 'var(--ink-muted)' },
  { key: 'spam', label: 'Spam', dot: 'var(--line-strong)' },
];
export const STATUS_KEYS = STATUSES.map((s) => s.key);
// Statuses that still need someone to act on them.
export const OPEN_STATUSES = ['new', 'contacted', 'qualified', 'proposal'];
export const statusOf = (key) => STATUSES.find((s) => s.key === key) ?? STATUSES[0];

export const PRIORITIES = [
  { key: 'low', label: 'Low' },
  { key: 'normal', label: 'Normal' },
  { key: 'high', label: 'High' },
];

export const ORIGINS = [
  { key: 'website', label: 'Website form' },
  { key: 'phone', label: 'Phone call' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'walk-in', label: 'Walk-in' },
  { key: 'referral', label: 'Referral' },
  { key: 'other', label: 'Other' },
];

// Same list as the tmfs consultation form's "Service of interest" dropdown.
export const SERVICES = ['Company Setup', 'Banking & Finance', 'Tax', 'Accounting & Audit', 'Corporate Services', 'Golden Visa', 'Something else'];

// How tracked website events read in journeys.
export const EVENT_VERBS = { pageview: 'Viewed', click: 'Clicked', engagement: 'Read', form_start: 'Started form', event: 'Event' };

export const ACTIVITY_LABELS = {
  created: 'Enquiry received',
  note: 'Note',
  call: 'Call logged',
  whatsapp: 'WhatsApp logged',
  meeting: 'Meeting logged',
  status: 'Status changed',
  assigned: 'Assigned',
  updated: 'Details updated',
  email_out: 'Email sent',
  email_in: 'Email received',
};

// Marketing channels, as classified by tmfs-backend (tracking/attribution.py).
export const CHANNELS = ['Direct', 'Organic search', 'Paid', 'Social', 'Email', 'AI assistants', 'Referral'];
