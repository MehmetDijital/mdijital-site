'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock, FileText } from 'lucide-react';

interface ProjectRequest {
  id: string;
  name: string;
  projectIdea: string;
  timeHorizon: string | null;
  status: string;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function ProjectRequestDetail({ request }: { request: ProjectRequest }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const dateTimeOptions: Intl.DateTimeFormatOptions = { ...dateOptions, hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const localeTag = locale === 'tr' ? 'tr-TR' : 'en-GB';

  const statusKey = request.status.toLowerCase().replace(' ', '') as 'received' | 'inprogress' | 'completed';
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-ice font-orbitron">{t('requestDetailTitle')}</h1>
      <div className="glass-panel p-8 rounded-xl border border-lead/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2 font-orbitron">{request.name}</h2>
            <div className="flex items-center gap-4 text-text-secondary text-sm font-rajdhani">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(request.createdAt).toLocaleDateString(localeTag, dateOptions)}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {t('updated')}: {new Date(request.updatedAt).toLocaleDateString(localeTag, dateOptions)}
              </div>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded text-sm font-bold font-rajdhani ${
              request.status === 'Received'
                ? 'bg-ice/20 text-ice'
                : request.status === 'In Progress'
                ? 'bg-purple/20 text-purple'
                : 'bg-lead text-text-secondary'
            }`}
          >
            {t(`status.${statusKey}`) || request.status}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-ice" size={20} />
              <h3 className="text-xl font-bold text-text-primary font-orbitron">{t('projectIdea')}</h3>
            </div>
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap font-rajdhani">
              {request.projectIdea}
            </p>
          </div>

          {request.timeHorizon && (
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2 font-orbitron">{t('timeHorizon')}</h3>
              <p className="text-text-secondary font-rajdhani">{request.timeHorizon}</p>
            </div>
          )}

          {request.adminNotes && request.adminNotes.trim() && (
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2 font-orbitron">{t('adminReply')}</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap font-rajdhani">
                {request.adminNotes.trim()}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-lead/50">
            <h3 className="text-lg font-bold text-text-primary mb-4 font-orbitron">{t('statusTimeline')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-ice"></div>
                <div>
                  <p className="text-text-primary font-bold font-rajdhani">{t('status.received')}</p>
                  <p className="text-text-secondary text-sm font-rajdhani">
                    {new Date(request.createdAt).toLocaleString(localeTag, dateTimeOptions)}
                  </p>
                </div>
              </div>
              {request.status !== 'Received' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple"></div>
                  <div>
                    <p className="text-text-primary font-bold font-rajdhani">{t('status.inProgress')}</p>
                    <p className="text-text-secondary text-sm font-rajdhani">
                      {request.status === 'In Progress'
                        ? new Date(request.updatedAt).toLocaleString(localeTag, dateTimeOptions)
                        : t('pending')}
                    </p>
                  </div>
                </div>
              )}
              {request.status === 'Completed' && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-lead"></div>
                  <div>
                    <p className="text-text-primary font-bold font-rajdhani">{t('status.completed')}</p>
                    <p className="text-text-secondary text-sm font-rajdhani">
                      {new Date(request.updatedAt).toLocaleString(localeTag, dateTimeOptions)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

