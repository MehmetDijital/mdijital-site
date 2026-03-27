import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AdminApplicationsList } from '@/components/admin/AdminApplicationsList';

export default async function AdminApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { locale } = await params;
  const applications = await prisma.jobApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      jobPosting: {
        select: { id: true, titleTR: true, titleEN: true },
      },
    },
  });

  const items = applications.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    status: a.status,
    cvPath: a.cvPath,
    jobPostingId: a.jobPostingId,
    jobTitleTR: a.jobPosting.titleTR,
    jobTitleEN: a.jobPosting.titleEN,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return <AdminApplicationsList initialApplications={items} locale={locale} />;
}
