'use client';

import { BTN_DANGER } from '../ui/styles';
import { deleteLead } from '@/app/(dash)/leads/actions';

export default function DeleteLead({ id, name }) {
  return (
    <form
      action={deleteLead.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete ${name} and their whole history? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className={BTN_DANGER}>Delete lead</button>
    </form>
  );
}
