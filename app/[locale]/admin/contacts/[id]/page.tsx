import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AdminContactDetail } from '@/components/admin/AdminContactDetail';
import { notFound } from 'next/navigation';

export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { id } = await params;

  const contact = await prisma.contactSubmission.findUnique({
    where: { id },
  });

  if (!contact) {
    notFound();
  }

  return <AdminContactDetail contact={contact} />;
}
