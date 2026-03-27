import { requireAdmin } from '@/lib/auth-utils';
import { AdminSettings } from '@/components/admin/AdminSettings';

export default async function AdminSettingsPage() {
  await requireAdmin();

  return <AdminSettings />;
}


