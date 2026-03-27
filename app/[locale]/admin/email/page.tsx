import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { AdminEmailSender } from '@/components/admin/AdminEmailSender';

export default async function AdminEmailPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <AdminEmailSender />;
}
