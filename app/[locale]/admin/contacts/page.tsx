import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AdminContactsList } from '@/components/admin/AdminContactsList';

export default async function AdminContactsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <AdminContactsList initialContacts={contacts} />;
}
