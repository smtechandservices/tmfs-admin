import Link from 'next/link';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import NewLeadForm from '@/components/lead/NewLeadForm';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'New lead' };

export default async function NewLeadPage() {
  const user = await requireUser();
  const { users } = await api('/api/team');
  return (
    <div>
      <Link href="/leads" className="mb-[14px] inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-ink-2 hover:text-ink">
        <Icon name="arrowLeft" size={14} /> Leads
      </Link>
      <PageHeader title="New lead" subtitle="Log an enquiry that came in by phone, WhatsApp, email or in person" />
      <Card>
        <NewLeadForm users={users} me={user.id} />
      </Card>
    </div>
  );
}
