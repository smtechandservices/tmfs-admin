'use client';

import { useRef } from 'react';
import Icon from './ui/Icon';
import { FIELD } from './ui/styles';

/**
 * GET form that re-submits whenever a select changes; the search box submits
 * on Enter. `fields`: [{ name, label, options: [[value, label]] }].
 */
export default function FilterBar({ action, values = {}, fields = [], hidden = {}, search = 'Search…' }) {
  const form = useRef(null);
  return (
    <form ref={form} action={action} method="get" className="flex flex-wrap items-center gap-[8px]">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      {search && (
        <label className="relative min-w-[220px] flex-[1_1_260px]">
          <span className="sr-only">Search</span>
          <Icon name="search" size={15} className="pointer-events-none absolute top-1/2 left-[11px] -translate-y-1/2 text-ink-muted" />
          <input name="q" type="search" defaultValue={values.q || ''} placeholder={search} className={`${FIELD} pl-[33px]`} />
        </label>
      )}
      {fields.map((f) => (
        <label key={f.name} className="flex-[0_1_auto]">
          <span className="sr-only">{f.label}</span>
          <select
            name={f.name}
            defaultValue={values[f.name] || ''}
            onChange={() => form.current?.requestSubmit()}
            className={`${FIELD} w-auto max-w-[220px] cursor-pointer pr-[28px]`}
          >
            {f.options.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
      ))}
    </form>
  );
}
