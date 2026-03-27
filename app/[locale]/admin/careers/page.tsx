import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { AdminCareersList } from '@/components/admin/AdminCareersList';

export default async function AdminCareersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin');
  }

  return <AdminCareersList />;
}
