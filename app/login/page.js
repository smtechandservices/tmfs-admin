import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { currentUser } from '@/lib/auth';

export const metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  if (await currentUser()) redirect('/');
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-[16px] py-[40px]">
      <div className="w-full max-w-[380px]">
        <div className="mb-[26px] flex flex-col items-center text-center">
          <img src="/logo.png" alt="" width={72} height={72} className="h-[72px] w-[72px]" />
          <h1 className="mt-[14px] font-display text-[22px] font-extrabold tracking-[-.02em] text-brand-ink">TMFS Admin</h1>
          <p className="mt-[4px] text-[13.5px] text-ink-muted">Leads, website analytics and email</p>
        </div>
        <div className="rounded-[14px] border border-line bg-surface p-[24px] shadow-[0_14px_32px_rgba(10,37,64,.1)]">
          <LoginForm next={next} />
        </div>
        <p className="mt-[16px] text-center text-[12px] text-ink-muted">Staff only. Ask an administrator for access.</p>
      </div>
    </div>
  );
}
