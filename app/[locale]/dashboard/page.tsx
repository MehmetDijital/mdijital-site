import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProjectRequestsList } from '@/components/dashboard/ProjectRequestsList';
import { User, FileText, Calendar } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const session = await requireAuth();
  const t = await getTranslations('dashboard');
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    include: {
      projectRequests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return null;
  }

  const stats = {
    total: user.projectRequests.length,
    received: user.projectRequests.filter((r) => r.status === 'Received').length,
    inProgress: user.projectRequests.filter((r) => r.status === 'In Progress').length,
    completed: user.projectRequests.filter((r) => r.status === 'Completed').length,
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-xl border border-lead/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary font-orbitron">{t('profileLabel')}</h2>
            <User className="text-ice" size={24} />
          </div>
          <p className="text-text-primary font-semibold font-rajdhani">{user.name || t('noName')}</p>
          <p className="text-sm text-text-secondary mt-1 font-rajdhani">{user.email}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-lead/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary font-orbitron">{t('totalRequests')}</h2>
            <FileText className="text-ice" size={24} />
          </div>
          <p className="text-3xl font-bold text-ice font-orbitron">{stats.total}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-lead/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary font-orbitron">{t('inProgress')}</h2>
            <Calendar className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-500 font-orbitron">{stats.inProgress}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-lead/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary font-orbitron">{t('completed')}</h2>
            <FileText className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500 font-orbitron">{stats.completed}</p>
        </div>
      </div>
      <ProjectRequestsList requests={user.projectRequests} />
    </div>
  );
}

