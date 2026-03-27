'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Briefcase, Calendar, User } from 'lucide-react';

function applicationStatusLabel(status: string, t: (k: string) => string): string {
  if (status === 'all') return t('all');
  if (status === 'New') return t('status.new');
  if (status === 'In Progress') return t('status.inProgress');
  if (status === 'Hired') return t('status.hired');
  if (status === 'Rejected') return t('status.rejected');
  return status;
}

interface ApplicationData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  cvPath: string;
  jobPostingId: string;
  jobTitleTR: string;
  jobTitleEN: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminApplicationsList({
  initialApplications,
  locale,
}: {
  initialApplications: ApplicationData[];
  locale: string;
}) {
  const t = useTranslations('admin.applications');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applications] = useState(initialApplications);

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const statusCounts = {
    all: applications.length,
    New: applications.filter((a) => a.status === 'New').length,
    'In Progress': applications.filter((a) => a.status === 'In Progress').length,
    Hired: applications.filter((a) => a.status === 'Hired').length,
    Rejected: applications.filter((a) => a.status === 'Rejected').length,
  };

  const jobTitle = (app: ApplicationData) =>
    locale === 'en' ? app.jobTitleEN : app.jobTitleTR;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 neon-text-purple">{t('title')}</h1>

      <div className="glass-panel p-6 rounded-xl border border-white/10 mb-6">
        <div className="flex gap-4 flex-wrap">
          {(['all', 'New', 'In Progress', 'Hired', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded transition-colors font-rajdhani ${
                statusFilter === status
                  ? status === 'all'
                    ? 'bg-neon-purple text-white'
                    : status === 'New'
                      ? 'bg-neon-green text-black'
                      : status === 'In Progress'
                        ? 'bg-yellow-500 text-black'
                        : status === 'Hired'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {applicationStatusLabel(status, t)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400">{t('noApplications')}</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <Link
              key={app.id}
              href={`/admin/applications/${app.id}`}
              className="block glass-panel p-4 rounded-lg border border-white/5 hover:border-neon-purple/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-neon-purple" size={20} />
                    <h3 className="text-lg font-bold text-white">{app.name}</h3>
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        app.status === 'New'
                          ? 'bg-neon-green/20 text-neon-green'
                          : app.status === 'In Progress'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : app.status === 'Hired'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {applicationStatusLabel(app.status, t)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                    <Briefcase size={14} />
                    {jobTitle(app)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{app.email}</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
