'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const locale = window.location.pathname.split('/')[1] || 'tr';
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('uppercase') || data.error?.includes('lowercase') || data.error?.includes('number')) {
          setError(data.error);
        } else if (data.error === 'User already exists') {
          // If user exists but email not verified, redirect to verification page
          setError(t('userExists') + ' ' + t('pleaseVerifyEmail'));
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          setError(data.error || t('registrationFailed'));
        }
        return;
      }

      // In development mode, show verification code
      if (data.devMode && data.verificationCode) {
        alert(`Development Mode: Verification Code: ${data.verificationCode}`);
      }

      // Redirect to email verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pointer-events-auto relative z-50">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-lead/50 pointer-events-auto relative z-50">
        <div className="text-center mb-8">
          <UserPlus className="text-5xl text-purple mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{t('title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pointer-events-auto relative z-50">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-purple outline-none transition-colors font-rajdhani pointer-events-auto"
              autoComplete="name"
              disabled={isLoading}
            />
          </div>

          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-purple outline-none transition-colors font-rajdhani pointer-events-auto"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-purple outline-none transition-colors font-rajdhani pointer-events-auto pr-10"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-text-quiet mt-1 font-rajdhani">{t('passwordHint')}</p>
          </div>

          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('confirmPassword')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-purple outline-none transition-colors font-rajdhani pointer-events-auto pr-10"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors pointer-events-auto"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password || !confirmPassword || password.length < 8 || password !== confirmPassword}
            className="w-full py-3 bg-purple text-text-primary font-bold uppercase tracking-widest hover:bg-purple/80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron pointer-events-auto"
          >
            {isLoading ? tCommon('loading') : t('submit')}
          </button>
        </form>

        <p className="text-center text-text-secondary text-sm mt-6 font-rajdhani">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/auth/login" className="text-purple hover:underline">
            {tCommon('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

