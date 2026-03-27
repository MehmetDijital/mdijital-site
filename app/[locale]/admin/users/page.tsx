import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { UsersList } from '@/components/admin/UsersList';

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { projectRequests: true },
      },
    },
  });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 neon-text-purple">User Management</h1>
      <UsersList users={users} />
    </div>
  );
}

