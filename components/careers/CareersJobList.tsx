'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Briefcase, Mail } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  jobType: string | null;
}

export function CareersJobList({ jobs, locale }: { jobs: Job[]; locale: string }) {
  const t = useTranslations('pages.careers');

  const jobTypeLabel = (type: string | null) => {
    if (!type) return null;
    const map: Record<string, string> = {
      FULL_TIME: 'fullTime',
      PART_TIME: 'partTime',
      CONTRACT: 'contract',
      REMOTE: 'remote',
    };
    const key = map[type];
    return key ? t(key) : type;
  };

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="p-6 rounded-xl bg-graphite/50 border border-lead/30 hover:border-ice/30 transition-colors"
        >
          <h3 className="text-xl font-bold text-text-primary font-orbitron mb-2">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary font-rajdhani mb-4">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {job.location}
              </span>
            )}
            {job.jobType && (
              <span className="flex items-center gap-1">
                <Briefcase size={16} />
                {jobTypeLabel(job.jobType)}
              </span>
            )}
          </div>
          <p className="text-text-secondary font-rajdhani whitespace-pre-wrap mb-4">{job.description}</p>
          <Link
            href={`/careers/apply/${job.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ice text-obsidian font-bold rounded hover:bg-ice/80 transition-colors font-orbitron text-sm"
          >
            <Mail size={16} />
            {t('apply')}
          </Link>
        </div>
      ))}
    </div>
  );
}
