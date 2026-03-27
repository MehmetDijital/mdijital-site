'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

interface Job {
  id: string;
  titleTR: string;
  titleEN: string;
  descriptionTR: string;
  descriptionEN: string;
  location: string;
  jobType: string;
  published: boolean;
}

export function AdminJobEdit({ job }: { job: Job }) {
  const t = useTranslations('admin.careers');
  const router = useRouter();
  const [form, setForm] = useState(job);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleTR: form.titleTR,
          titleEN: form.titleEN,
          descriptionTR: form.descriptionTR,
          descriptionEN: form.descriptionEN,
          location: form.location || null,
          jobType: form.jobType || null,
          published: form.published,
        }),
      });
      if (res.ok) router.push('/admin/careers');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/admin/careers"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-ice mb-6 font-rajdhani"
        >
          <ArrowLeft size={18} />
          {t('title')}
        </Link>
        <h1 className="text-3xl font-bold text-text-primary font-orbitron mb-8">{t('edit')}</h1>
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl border border-lead/50 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('titleTR')}</label>
            <input
              type="text"
              value={form.titleTR}
              onChange={(e) => setForm((f) => ({ ...f, titleTR: e.target.value }))}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('titleEN')}</label>
            <input
              type="text"
              value={form.titleEN}
              onChange={(e) => setForm((f) => ({ ...f, titleEN: e.target.value }))}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('descriptionTR')}</label>
            <textarea
              value={form.descriptionTR}
              onChange={(e) => setForm((f) => ({ ...f, descriptionTR: e.target.value }))}
              rows={6}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('descriptionEN')}</label>
            <textarea
              value={form.descriptionEN}
              onChange={(e) => setForm((f) => ({ ...f, descriptionEN: e.target.value }))}
              rows={6}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('location')}</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('jobType')}</label>
            <select
              value={form.jobType}
              onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
            >
              <option value="">—</option>
              <option value="FULL_TIME">{t('FULL_TIME')}</option>
              <option value="PART_TIME">{t('PART_TIME')}</option>
              <option value="CONTRACT">{t('CONTRACT')}</option>
              <option value="REMOTE">{t('REMOTE')}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 font-rajdhani">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="rounded"
            />
            {t('published')}
          </label>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-ice text-obsidian font-bold rounded hover:bg-ice/80 disabled:opacity-50 font-orbitron"
            >
              {submitting ? '...' : t('saveChanges')}
            </button>
            <Link
              href="/admin/careers"
              className="px-6 py-3 border border-lead rounded text-text-secondary hover:text-text-primary font-rajdhani"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
