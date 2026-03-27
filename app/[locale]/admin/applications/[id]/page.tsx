import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AdminApplicationDetail } from '@/components/admin/AdminApplicationDetail';

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { id, locale } = await params;

  const application = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      jobPosting: {
        select: { id: true, titleTR: true, titleEN: true },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const data = {
    ...application,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
  const cvBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <AdminApplicationDetail
      application={data}
      locale={locale}
      cvBaseUrl={cvBaseUrl}
    />
  );
}
