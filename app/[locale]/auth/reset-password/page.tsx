'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  const validateToken = useCallback(async (tokenValue: string) => {
    try {
      const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsValidToken(false);
        setError(data.error || t('invalidToken'));
        return;
      }

      setIsValidToken(true);
    } catch (err) {
      setIsValidToken(false);
      setError(t('errorOccurred'));
    } finally {
      setIsValidating(false);
    }
  }, [t]);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setIsValidating(false);
      setError(t('noToken'));
    }
  }, [searchParams, validateToken, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    // Validate password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError(t('weakPassword'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('resetError'));
        return;
      }

      setSuccess(t('resetSuccess'));
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-lead/50 text-center">
          <p className="text-text-secondary font-rajdhani">{t('validating')}</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-lead/50">
          <div className="text-center mb-8">
            <Lock className="text-5xl text-red-500 mx-auto mb-4" size={48} />
            <h1 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{t('invalidTokenTitle')}</h1>
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm mb-4">
              {error}
            </div>
          )}
          <p className="text-center text-text-secondary text-sm mb-6 font-rajdhani">{t('invalidTokenMessage')}</p>
          <Link
            href="/auth/forgot-password"
            className="block w-full text-center py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded font-orbitron"
          >
            {t('requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-lead/50">
        <div className="text-center mb-8">
          <Lock className="text-5xl text-ice mx-auto mb-4" size={48} />
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
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('newPassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
              required
              minLength={8}
              autoFocus
              autoComplete="new-password"
              disabled={isLoading || !!success}
            />
            <p className="text-xs text-text-quiet mt-1 font-rajdhani">{t('passwordHint')}</p>
            {password && password.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) && (
              <p className="text-xs text-red-400 mt-1 font-rajdhani">
                {t('weakPassword')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-graphite/80 border p-3 rounded text-text-primary focus:outline-none transition-colors font-rajdhani ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-lead focus:border-ice'
              }`}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isLoading || !!success}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400 mt-1 font-rajdhani">
                {t('passwordsDontMatch')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              password.length < 8 ||
              password !== confirmPassword ||
              !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) ||
              !!success
            }
            className="w-full py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron"
          >
            {isLoading ? t('resetting') : success ? t('resetSuccess') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

