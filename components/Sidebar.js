'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from './ui/Icon';
import { logout } from '@/app/login/actions';

const NAV = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/leads', label: 'Leads', icon: 'leads', badge: 'newLeads' },
  { href: '/inbox', label: 'Inbox', icon: 'inbox' },
  { href: '/analytics', label: 'Analytics', icon: 'chart' },
  { href: '/analytics/sessions', label: 'Visitors', icon: 'sessions' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  if (href === '/analytics') return pathname === '/analytics';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ user, counts = {} }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav className="flex flex-col gap-[2px] px-[10px]">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const badge = item.badge ? counts[item.badge] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex h-[38px] items-center gap-[11px] rounded-[8px] px-[11px] text-[13.5px] font-medium ${
              active ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <Icon name={item.icon} size={18} />
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span className="tabular rounded-full bg-accent px-[7px] py-[1px] text-[11px] font-bold text-white" aria-label={`${badge} new`}>
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-[10px] px-[20px]">
      <img src="/logo.png" alt="" width={36} height={36} className="h-[36px] w-[36px] flex-none" />
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-extrabold tracking-[-.01em] text-brand-ink">TMFS Admin</span>
        <span className="block text-[11px] text-ink-muted">Time Machine Financial Services</span>
      </span>
    </Link>
  );

  const account = (
    <div className="mx-[10px] flex items-center gap-[10px] rounded-[10px] border border-line bg-surface-2 px-[11px] py-[9px]">
      <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
        {user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-semibold text-ink">{user.name}</span>
        <span className="block truncate text-[11.5px] text-ink-muted capitalize">{user.role}</span>
      </span>
      <form action={logout}>
        <button type="submit" aria-label="Sign out" title="Sign out" className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] text-ink-muted hover:bg-surface-3 hover:text-ink">
          <Icon name="logout" size={16} />
        </button>
      </form>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col gap-[22px] border-r border-line bg-surface py-[20px] max-lg:hidden">
        {brand}
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {account}
      </aside>

      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-line bg-surface pr-[12px] lg:hidden">
        <Link href="/" className="flex items-center gap-[9px] px-[16px]">
          <img src="/logo.png" alt="" width={30} height={30} className="h-[30px] w-[30px] flex-none" />
          <span className="font-display text-[15px] font-extrabold text-brand-ink">TMFS Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-surface-2"
        >
          <Icon name="menu" size={20} />
          {counts.newLeads > 0 && <span className="absolute mt-[-18px] ml-[18px] h-[8px] w-[8px] rounded-full bg-accent" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-[rgba(10,31,68,.45)]" />
          <div className="absolute inset-y-0 left-0 flex w-[272px] max-w-[85vw] flex-col gap-[20px] bg-surface py-[18px] shadow-[0_20px_48px_rgba(10,37,64,.14),0_4px_10px_rgba(10,37,64,.06)]">
            {brand}
            <div className="flex-1 overflow-y-auto">{nav}</div>
            {account}
          </div>
        </div>
      )}
    </>
  );
}
