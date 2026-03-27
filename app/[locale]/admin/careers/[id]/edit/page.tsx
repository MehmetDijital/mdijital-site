import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AdminJobEdit } from '@/components/admin/AdminJobEdit';

export default async function AdminJobEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin');
  }

  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({ where: { id } });

  if (!job) notFound();

  return (
    <AdminJobEdit
      job={{
        id: job.id,
        titleTR: job.titleTR,
        titleEN: job.titleEN,
        descriptionTR: job.descriptionTR,
        descriptionEN: job.descriptionEN,
        location: job.location ?? '',
        jobType: job.jobType ?? '',
        published: job.published,
      }}
    />
  );
}
