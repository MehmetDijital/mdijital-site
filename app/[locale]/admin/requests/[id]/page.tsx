import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AdminRequestDetail } from '@/components/admin/AdminRequestDetail';

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const request = await prisma.projectRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          id: true,
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  return <AdminRequestDetail request={request as any} />;
}

