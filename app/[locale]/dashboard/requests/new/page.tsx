'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Send, Building2, DollarSign, Calendar, Briefcase } from 'lucide-react';

export default function NewRequestPage() {
  const tTemas = useTranslations('temas');
  const t = useTranslations('temas.form');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [name, setName] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [productRange, setProductRange] = useState('');
  const [timeHorizon, setTimeHorizon] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/project-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          projectIdea,
          productRange,
          timeHorizon,
          budgetRange,
          companyName,
          companyIndustry,
          companySector,
          companySize,
          companyWebsite,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('submitError'));
        return;
      }

      setSuccess(true);
      setError('');
      setTimeout(() => router.push('/dashboard'), 1800);
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-ice font-orbitron">
        {t('title')}
      </h1>
      <p className="text-text-secondary mb-8 font-rajdhani">{t('subtitle')}</p>
      <div className="glass-panel p-8 rounded-xl border border-lead/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-3 rounded text-sm">
              {t('requestSubmitted')}
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('projectIdea')}</label>
            <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('projectIdeaInfo')}</p>
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              rows={6}
              className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium flex items-center gap-2">
              <Briefcase size={16} />
              {t('productRange')}
            </label>
            <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('productRangeInfo')}</p>
            <textarea
              value={productRange}
              onChange={(e) => setProductRange(e.target.value)}
              rows={3}
              className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
              placeholder={t('placeholderProductRange')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium flex items-center gap-2">
                <Calendar size={16} />
                {t('timeHorizon')}
              </label>
              <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('timeHorizonInfo')}</p>
              <input
                type="text"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                placeholder={t('placeholderTimeHorizon')}
                className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium flex items-center gap-2">
                <DollarSign size={16} />
                {t('budgetRange')}
              </label>
              <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('budgetRangeInfo')}</p>
              <input
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder={t('placeholderBudgetRange')}
                className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
              />
            </div>
          </div>

          <div className="border-t border-lead/30 pt-6 mt-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 font-orbitron flex items-center gap-2">
              <Building2 size={20} />
              {t('companySectionTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('companyName')}</label>
                <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('companyNameInfo')}</p>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('companyIndustry')}</label>
                <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('companyIndustryInfo')}</p>
                <input
                  type="text"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  placeholder={t('placeholderCompanyIndustry')}
                  className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('companySector')}</label>
                <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('companySectorInfo')}</p>
                <input
                  type="text"
                  value={companySector}
                  onChange={(e) => setCompanySector(e.target.value)}
                  placeholder={t('placeholderCompanySector')}
                  className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('companySize')}</label>
                <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('companySizeInfo')}</p>
                <input
                  type="text"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  placeholder={t('placeholderCompanySize')}
                  className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani font-medium">{t('companyWebsite')}</label>
                <p className="text-xs text-text-quiet mb-2 font-rajdhani">{t('companyWebsiteInfo')}</p>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                />
              </div>
            </div>
          </div>

          {process.env.NEXT_PUBLIC_CALENDLY_LINK && (
            <div className="bg-ice/10 border border-ice/30 rounded-lg p-4 mt-6">
              <p className="text-sm text-text-secondary mb-3 font-rajdhani">{t('calendlyNote')}</p>
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded font-orbitron text-sm"
              >
                {t('createMeeting')}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2 border border-ice/30 font-orbitron mt-6"
          >
            <Send size={20} />
            {isSubmitting ? tCommon('loading') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

