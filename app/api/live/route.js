import { NextResponse } from 'next/server';
import { request } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Polled by the dashboard's live card; forwarded to tmfs-backend with the session token.
export async function GET() {
  const res = await request('/api/live');
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}
