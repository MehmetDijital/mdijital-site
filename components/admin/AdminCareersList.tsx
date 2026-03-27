'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface JobPosting {
  id: string;
  titleTR: string;
  titleEN: string;
  descriptionTR: string;
  descriptionEN: string;
  location: string | null;
  jobType: string | null;
  published: boolean;
  createdAt: string;
}

export function AdminCareersList() {
  const t = useTranslations('admin.careers');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titleTR: '',
    titleEN: '',
    descriptionTR: '',
    descriptionEN: '',
    location: '',
    jobType: '',
    published: false,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
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
      if (res.ok) {
        setForm({ titleTR: '', titleEN: '', descriptionTR: '', descriptionEN: '', location: '', jobType: '', published: false });
        setShowForm(false);
        fetchJobs();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete') + '?')) return;
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchJobs();
    } catch {}
  };

  const handleTogglePublish = async (job: JobPosting) => {
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !job.published }),
      });
      if (res.ok) fetchJobs();
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary font-rajdhani">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-orbitron">{t('title')}</h1>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-ice text-obsidian font-bold rounded-lg hover:bg-ice/80 transition-colors font-orbitron"
          >
            <Plus size={20} />
            {t('newJob')}
          </button>
        </div>

        {showForm && (
          <div className="glass-panel p-6 rounded-xl border border-lead/50 mb-8">
            <form onSubmit={handleCreate} className="space-y-4">
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
                  rows={4}
                  className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary font-rajdhani"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1 font-rajdhani">{t('descriptionEN')}</label>
                <textarea
                  value={form.descriptionEN}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionEN: e.target.value }))}
                  rows={4}
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
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-ice text-obsidian font-bold rounded hover:bg-ice/80 disabled:opacity-50 font-orbitron"
                >
                  {submitting ? '...' : t('newJob')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-lead rounded text-text-secondary hover:text-text-primary font-rajdhani"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {jobs.length === 0 && !showForm ? (
          <div className="glass-panel p-8 rounded-xl border border-lead/50 text-center">
            <p className="text-text-secondary font-rajdhani">{t('noJobs')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="glass-panel p-6 rounded-xl border border-lead/50 flex justify-between items-start gap-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-text-primary font-orbitron">{job.titleTR} / {job.titleEN}</h2>
                  {job.location && (
                    <p className="text-text-secondary text-sm font-rajdhani mt-1">{job.location}</p>
                  )}
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs font-rajdhani ${
                      job.published ? 'bg-ice/20 text-ice' : 'bg-lead text-text-quiet'
                    }`}
                  >
                    {job.published ? t('published') : t('draft')}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(job)}
                    className="p-2 rounded text-text-secondary hover:text-ice transition-colors"
                    title={job.published ? 'Unpublish' : 'Publish'}
                  >
                    {job.published ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <Link
                    href={`/admin/careers/${job.id}/edit`}
                    className="p-2 rounded text-text-secondary hover:text-ice transition-colors"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(job.id)}
                    className="p-2 rounded text-text-secondary hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
