'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FileText } from 'lucide-react';

interface ProjectRequest {
  id: string;
  name: string;
  projectIdea: string;
  status: string;
  createdAt: Date;
}

export function ProjectRequestsList({ requests }: { requests: ProjectRequest[] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary font-orbitron">{t('projectRequests')}</h2>
      {requests.length === 0 ? (
        <div className="glass-panel p-8 rounded-xl border border-lead/50 text-center">
          <FileText className="text-4xl text-text-quiet mx-auto mb-4" size={48} />
          <p className="text-text-secondary mb-4 font-rajdhani">{t('noRequestsYet')}</p>
          <Link
            href="/dashboard/requests/new"
            className="inline-block px-6 py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded font-orbitron"
          >
            {t('newRequest')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/requests/${request.id}`}
              className="glass-panel p-6 rounded-xl border border-lead/50 hover:border-ice/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-text-primary font-orbitron">{request.name}</h3>
                <span
                  className={`px-3 py-1 rounded text-sm font-bold font-rajdhani ${
                    request.status === 'Received'
                      ? 'bg-ice/20 text-ice'
                      : request.status === 'In Progress'
                      ? 'bg-purple/20 text-purple'
                      : 'bg-lead text-text-secondary'
                  }`}
                >
                  {t(`status.${request.status.toLowerCase().replace(' ', '')}`) || request.status}
                </span>
              </div>
              <p className="text-text-secondary text-sm line-clamp-2 font-rajdhani">{request.projectIdea}</p>
              <p className="text-text-quiet text-xs mt-2 font-rajdhani">
                {new Date(request.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', dateOptions)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

