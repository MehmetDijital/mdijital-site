'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Send, X, Info } from 'lucide-react';
import { getCsrfToken } from '@/lib/csrf-client';

export function Temas() {
  const t = useTranslations('temas');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const form = e.currentTarget;

    const formData = new FormData(form);
    const email = (formData.get('email') as string)?.trim() || undefined;
    const data = {
      name: formData.get('name'),
      email: email || undefined,
      projectIdea: formData.get('projectIdea'),
      timeHorizon: formData.get('timeHorizon'),
      thresholdQuestion: formData.get('thresholdQuestion'),
      locale: typeof window !== 'undefined' ? (window.location.pathname.startsWith('/en') ? 'en' : 'tr') : 'tr',
    };

    try {
      const token = await getCsrfToken();
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowSuccess(true);
        form?.reset();
        setTimeout(() => {
          setShowSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        const resData = await response.json().catch(() => ({}));
        setError((resData.error as string) || t('form.submitError'));
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('form.errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="temas" className="w-full max-w-4xl mb-20 py-20">
        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="group text-center relative overflow-hidden glass-panel p-10 rounded-2xl border border-lead/50 hover:border-purple/50 transition-all duration-300 w-full md:w-2/3 micro-interaction"
          >
            <div className="mb-6 inline-block p-4 rounded-full border border-lead group-hover:border-ice group-hover:bg-ice/10 transition-colors">
              <Send className="text-3xl text-text-primary group-hover:text-ice" size={32} />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-text-primary font-orbitron">{t('title')}</h2>
            <p className="text-text-secondary mb-8 font-rajdhani">{t('subtitle')}</p>
            <span className="inline-block px-8 py-3 bg-graphite text-text-primary font-bold uppercase tracking-widest hover:bg-purple/30 hover:text-ice transition-colors rounded border border-lead/50 font-orbitron">
              {t('form.submit')}
            </span>
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-obsidian/90"
          style={{
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'all' : 'none',
            transition: 'opacity 0.4s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="glass-panel w-full max-w-lg rounded-xl relative shadow-[0_0_50px_rgba(143,175,203,0.1)] border border-lead/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-graphite/50 hover:bg-graphite flex items-center justify-center transition-colors text-text-primary hover:text-ice"
            >
              <X size={20} />
            </button>
            <div className="p-8 md:p-10 text-center">
              {showSuccess ? (
                <div className="py-8">
                  <p className="text-text-primary text-lg">{t('form.success')}</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <Send className="text-5xl text-ice mb-6 mx-auto" size={48} />
                  <h2 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{t('title')}</h2>
                  <p className="text-text-secondary mb-8 text-sm font-rajdhani">{t('subtitle')}</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <textarea
                        name="projectIdea"
                        placeholder={t('form.projectIdea')}
                        rows={4}
                        className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                        required
                      />
                      <div className="absolute top-2 right-2 group/info">
                        <Info size={16} className="text-text-quiet hover:text-ice transition-colors cursor-help" />
                        <div className="absolute right-0 top-6 w-64 p-2 bg-graphite border border-lead rounded text-xs text-text-secondary opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10 font-rajdhani">
                          {t('form.projectIdeaInfo')}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="timeHorizon"
                        placeholder={t('form.timeHorizon')}
                        className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors text-center placeholder:text-text-quiet font-rajdhani"
                        required
                      />
                      <div className="absolute top-2 right-2 group/info">
                        <Info size={16} className="text-text-quiet hover:text-ice transition-colors cursor-help" />
                        <div className="absolute right-0 top-6 w-64 p-2 bg-graphite border border-lead rounded text-xs text-text-secondary opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10 font-rajdhani">
                          {t('form.timeHorizonInfo')}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <textarea
                        name="thresholdQuestion"
                        placeholder={t('form.thresholdQuestion')}
                        rows={3}
                        className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors placeholder:text-text-quiet font-rajdhani"
                        required
                      />
                      <div className="absolute top-2 right-2 group/info">
                        <Info size={16} className="text-text-quiet hover:text-ice transition-colors cursor-help" />
                        <div className="absolute right-0 top-6 w-64 p-2 bg-graphite border border-lead rounded text-xs text-text-secondary opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10 font-rajdhani">
                          {t('form.thresholdQuestionInfo')}
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder={t('form.name')}
                      className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors text-center placeholder:text-text-quiet font-rajdhani"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder={t('form.email')}
                      className="w-full bg-graphite/50 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors text-center placeholder:text-text-quiet font-rajdhani"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-graphite text-text-primary font-bold uppercase tracking-widest hover:bg-purple/30 hover:text-ice transition-colors rounded disabled:opacity-50 border border-lead/50 font-orbitron"
                    >
                      {isSubmitting ? t('common.loading') : t('form.submit')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

