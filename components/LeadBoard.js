'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { STATUSES } from '@/lib/constants';
import { aed, ago } from '@/lib/format';
import { setStatus } from '@/app/(dash)/leads/actions';

const COLUMNS = STATUSES.filter((s) => s.key !== 'spam');

/** Kanban by status. Drag a card to another column, or use its status menu. */
export default function LeadBoard({ leads }) {
  const [, start] = useTransition();
  const [items, move] = useOptimistic(leads, (state, { id, status }) => state.map((l) => (l.id === id ? { ...l, status } : l)));
  const [over, setOver] = useState(null);

  const change = (id, status) =>
    start(async () => {
      move({ id, status });
      await setStatus(id, status);
    });

  return (
    <div className="relative -mx-[4px] flex items-start gap-[12px] overflow-x-auto px-[4px] pb-[12px]">
      {COLUMNS.map((col) => {
        const cards = items.filter((l) => l.status === col.key);
        const total = cards.reduce((s, l) => s + (Number(l.value_aed) || 0), 0);
        return (
          <section
            key={col.key}
            aria-label={col.label}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col.key);
            }}
            onDragLeave={() => setOver((o) => (o === col.key ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = Number(e.dataTransfer.getData('text/plain'));
              if (id) change(id, col.key);
            }}
            className={`flex w-[272px] flex-none flex-col rounded-[12px] border bg-surface-2 transition-colors ${over === col.key ? 'border-brand-ink' : 'border-line'}`}
          >
            <header className="flex items-center justify-between gap-[8px] px-[12px] pt-[12px] pb-[8px]">
              <span className="flex items-center gap-[8px] text-[13px] font-semibold text-ink">
                <span className="h-[8px] w-[8px] rounded-full" style={{ background: col.dot }} />
                {col.label}
                <span className="tabular font-medium text-ink-muted">{cards.length}</span>
              </span>
              {total > 0 && <span className="tabular text-[11.5px] text-ink-muted">{aed(total)}</span>}
            </header>
            <ul className="flex max-h-[calc(100vh-230px)] min-h-[120px] flex-col gap-[8px] overflow-y-auto px-[8px] pb-[10px]">
              {cards.map((l) => (
                <li
                  key={l.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(l.id));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="cursor-grab rounded-[9px] border border-line bg-surface p-[11px] shadow-[0_1px_2px_rgba(10,37,64,.05)] active:cursor-grabbing"
                >
                  <Link href={`/leads/${l.id}`} className="block text-[13px] font-semibold text-ink hover:text-brand-ink">{l.name}</Link>
                  <div className="mt-[2px] truncate text-[12px] text-ink-muted">{[l.company, l.service].filter(Boolean).join(' · ') || l.email || l.phone}</div>
                  <div className="mt-[9px] flex items-center justify-between gap-[8px] text-[11.5px] text-ink-2">
                    <span className="truncate">{l.assignee_name || 'Unassigned'}</span>
                    <span className="flex-none">{l.value_aed ? aed(l.value_aed) : ago(l.created_at)}</span>
                  </div>
                  <label className="mt-[8px] block">
                    <span className="sr-only">Move {l.name} to</span>
                    <select
                      value={l.status}
                      onChange={(e) => change(l.id, e.target.value)}
                      className="h-[26px] w-full cursor-pointer rounded-[6px] border border-line bg-surface-2 px-[6px] text-[11.5px] text-ink-2"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
