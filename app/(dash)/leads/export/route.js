import { request } from '@/lib/api';

// CSV of the leads list with the same filters as the page, built by
// tmfs-backend and streamed through so the browser keeps its session cookie.

export async function GET(req) {
  const query = Object.fromEntries(new URL(req.url).searchParams);
  const res = await request('/api/leads/export', { query });
  if (!res.ok) return new Response(res.status === 401 ? 'Unauthorized' : 'Export failed', { status: res.status });
  return new Response(res.body, {
    headers: {
      'Content-Type': res.headers.get('content-type') || 'text/csv; charset=utf-8',
      'Content-Disposition': res.headers.get('content-disposition') || 'attachment; filename="tmfs-leads.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
