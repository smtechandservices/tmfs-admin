import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { session } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashLayout({ children }) {
  const s = await session();
  if (!s) redirect('/login');
  return (
    <div className="flex min-h-screen max-lg:flex-col">
      <Sidebar user={s.user} counts={s.counts} />
      <main className="min-w-0 flex-1 px-[28px] py-[26px] max-lg:px-[16px] max-lg:py-[18px]">
        <div className="mx-auto max-w-[1360px]">{children}</div>
      </main>
    </div>
  );
}
