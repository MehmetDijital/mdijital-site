import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProjectRequestDetail } from '@/components/dashboard/ProjectRequestDetail';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const session = await requireAuth();
  const { id, locale } = await params;

  const request = await prisma.projectRequest.findFirst({
    where: {
      id,
      user: {
        email: session.user?.email || '',
      },
    },
  });

  if (!request) {
    notFound();
  }

  return <ProjectRequestDetail request={request} />;
}

