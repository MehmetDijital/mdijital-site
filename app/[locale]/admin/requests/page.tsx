import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { AdminRequestsList } from '@/components/admin/AdminRequestsList';

export default async function AdminRequestsPage() {
  await requireAdmin();

  const requests = await prisma.projectRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 neon-text-purple">Project Requests</h1>
      <AdminRequestsList requests={requests} />
    </div>
  );
}

