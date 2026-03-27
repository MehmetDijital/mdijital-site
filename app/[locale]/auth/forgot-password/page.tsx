'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const locale = window.location.pathname.split('/')[1] || 'tr';
      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(t('tooManyRequests'));
        } else {
          setError(data.error || t('errorOccurred'));
        }
        return;
      }

      setSuccess(t('successMessage'));
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-lead/50">
        <div className="text-center mb-8">
          <KeyRound className="text-5xl text-ice mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{t('title')}</h1>
          <p className="text-text-secondary text-sm font-rajdhani">{t('subtitle')}</p>
        </div>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded text-sm mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
              required
              autoFocus
              autoComplete="email"
              disabled={isLoading || !!success}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !!success}
            className="w-full py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron"
          >
            {isLoading ? tCommon('loading') : success ? t('submitted') : t('submit')}
          </button>
        </form>

        <p className="text-center text-text-secondary text-sm mt-6 font-rajdhani">
          <Link href="/auth/login" className="text-ice hover:underline">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}

