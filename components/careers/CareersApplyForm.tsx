'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Upload } from 'lucide-react';
import { getCsrfToken } from '@/lib/csrf-client';

interface CareersApplyFormProps {
  jobId: string;
  jobTitle: string;
}

export function CareersApplyForm({ jobId, jobTitle }: CareersApplyFormProps) {
  const t = useTranslations('pages.careers');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = t('errorRequired');
    if (!email.trim()) err.email = t('errorRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = t('errorInvalidEmail');
    if (!cv || cv.size === 0) err.cv = t('errorCvRequired');
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('jobPostingId', jobId);
      formData.set('name', name.trim());
      formData.set('email', email.trim());
      if (phone.trim()) formData.set('phone', phone.trim());
      if (coverLetter.trim()) formData.set('coverLetter', coverLetter.trim());
      if (cv) formData.set('cv', cv);
      const token = await getCsrfToken();
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'X-CSRF-Token': token },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          res.status === 409 && (data.code === 'DUPLICATE_APPLICATION' || data.error === 'duplicate')
            ? t('errorDuplicate')
            : data.error || 'Application failed';
        setError(msg);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-8 rounded-xl border border-lead/50 text-center">
        <p className="text-text-primary font-rajdhani text-lg mb-6">{t('successMessage')}</p>
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-ice text-obsidian font-bold rounded hover:bg-ice/80 transition-colors font-orbitron text-sm"
        >
          <ArrowLeft size={16} />
          {t('backToCareers')}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
      <h2 className="text-2xl font-bold text-text-primary font-orbitron mb-2">
        {t('applyTitle', { title: jobTitle })}
      </h2>
      <p className="text-text-secondary font-rajdhani mb-6">{t('applySubtitle')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1 font-rajdhani">
            {t('name')} *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded bg-graphite/50 border border-lead/30 text-text-primary font-rajdhani focus:border-ice/50 focus:outline-none"
            required
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1 font-rajdhani">
            {t('email')} *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-graphite/50 border border-lead/30 text-text-primary font-rajdhani focus:border-ice/50 focus:outline-none"
            required
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1 font-rajdhani">
            {t('phone')}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 rounded bg-graphite/50 border border-lead/30 text-text-primary font-rajdhani focus:border-ice/50 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-text-primary mb-1 font-rajdhani">
            {t('coverLetter')}
          </label>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded bg-graphite/50 border border-lead/30 text-text-primary font-rajdhani focus:border-ice/50 focus:outline-none resize-y"
          />
        </div>
        <div>
          <label htmlFor="cv" className="block text-sm font-medium text-text-primary mb-1 font-rajdhani">
            {t('cvUpload')} *
          </label>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-graphite/50 border border-lead/30 rounded cursor-pointer hover:border-ice/30 transition-colors font-rajdhani text-text-secondary">
              <Upload size={18} />
              <span>{cv ? cv.name : t('cvUpload')}</span>
              <input
                id="cv"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => setCv(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          {fieldErrors.cv && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.cv}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-ice text-obsidian font-bold rounded hover:bg-ice/80 transition-colors font-orbitron text-sm disabled:opacity-50"
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 px-4 py-2 border border-lead/50 text-text-secondary rounded hover:border-ice/30 font-rajdhani text-sm"
          >
            <ArrowLeft size={16} />
            {t('backToCareers')}
          </Link>
        </div>
      </form>
    </div>
  );
}
