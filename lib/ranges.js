// Date-range presets and Core Web Vitals thresholds. The backend resolves
// ranges itself (tracking/reports.py); the UI needs the list for its tabs.

export const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: '12m', label: 'Last 12 months' },
];

// Good ≤ first, poor > second, in ms except CLS.
export const VITALS = [
  { key: 'LCP', label: 'Largest Contentful Paint', good: 2500, poor: 4000, unit: 'ms' },
  { key: 'INP', label: 'Interaction to Next Paint', good: 200, poor: 500, unit: 'ms' },
  { key: 'CLS', label: 'Cumulative Layout Shift', good: 0.1, poor: 0.25, unit: '' },
  { key: 'FCP', label: 'First Contentful Paint', good: 1800, poor: 3000, unit: 'ms' },
  { key: 'TTFB', label: 'Time to First Byte', good: 800, poor: 1800, unit: 'ms' },
];

export function vitalRating(v, value) {
  if (value === null || value === undefined) return null;
  return value <= v.good ? 'good' : value <= v.poor ? 'warning' : 'critical';
}
