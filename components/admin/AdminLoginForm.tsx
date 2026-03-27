'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff } from 'lucide-react';
import styles from './AdminLoginForm.module.css';

export default function AdminLoginForm({ redirectTo = '/admin' }: { redirectTo?: string }) {
  const t = useTranslations('auth.admin.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submitInProgress = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitInProgress.current) return;
    setError('');
    submitInProgress.current = true;
    setIsLoading(true);

    const doRedirect = () => {
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'admin.mdijital.io') {
          window.location.href = '/panel';
        } else {
          window.location.href = redirectTo;
        }
      } else {
        router.replace(redirectTo);
        router.refresh();
      }
    };

    try {
      const { signIn } = await import('next-auth/react');
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError(t('invalidCredentials'));
        } else {
          setError(t('errorOccurred'));
        }
        return;
      }

      doRedirect();
    } catch (err) {
      console.warn('Admin login client error (session may exist):', err);
      doRedirect();
    } finally {
      submitInProgress.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-auto relative overflow-hidden" suppressHydrationWarning>
      <div className={styles.fogLayer} aria-hidden />
      <div className={styles.fogLayerSlow} aria-hidden />
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border-2 border-red-500/30 shadow-2xl shadow-red-500/10 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4 border-2 border-red-500/50">
            <Shield className="text-red-400" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{t('title')}</h1>
          <p className="text-text-secondary text-sm font-rajdhani">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/50 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-2 font-medium font-rajdhani">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-graphite/80 border-2 border-lead p-3 rounded text-text-primary focus:border-red-500 outline-none transition-colors font-rajdhani"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2 font-medium font-rajdhani">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-graphite/80 border-2 border-lead p-3 rounded text-text-primary focus:border-red-500 outline-none transition-colors pr-10 font-rajdhani"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-quiet hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-text-primary font-bold uppercase tracking-widest transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 font-orbitron"
          >
            {isLoading ? t('loading') : t('submit')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-lead/50">
          <p className="text-center text-text-quiet text-xs font-rajdhani">
            {t('securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
