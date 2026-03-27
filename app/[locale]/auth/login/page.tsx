'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const wolfSoundRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || hasPlayedRef.current) return;

    wolfSoundRef.current = new Audio('/sounds/wolf.wav');
    wolfSoundRef.current.volume = 0.7;
    wolfSoundRef.current.preload = 'auto';
    wolfSoundRef.current.loop = false;

    const playWolfSound = async () => {
      if (wolfSoundRef.current && !hasPlayedRef.current) {
        try {
          await wolfSoundRef.current.play();
          hasPlayedRef.current = true;
        } catch (err) {
          // Ignore autoplay errors
        }
      }
    };

    playWolfSound();

    return () => {
      if (wolfSoundRef.current) {
        wolfSoundRef.current.pause();
        wolfSoundRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const locale = window.location.pathname.split('/')[1] || 'tr';
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          setError(t('emailNotVerified'));
        } else if (data.error === 'ADMIN_MUST_USE_ADMIN_LOGIN') {
          // Redirect admin users to admin login
          router.push('/admin');
          return;
        } else {
          setError(t('invalidCredentials'));
        }
        return;
      }

      window.location.href = '/dashboard';
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
          <LogIn className="text-5xl text-ice mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{t('title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pointer-events-auto relative z-50">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani pointer-events-auto"
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
                className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani pointer-events-auto pr-10"
                required
                autoComplete="current-password"
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
          </div>

          <div className="flex items-center pointer-events-auto">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 bg-graphite/80 border border-lead rounded text-purple focus:ring-purple focus:ring-2 cursor-pointer pointer-events-auto"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary font-rajdhani cursor-pointer pointer-events-auto">
              {t('rememberMe')}
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron pointer-events-auto"
          >
            {isLoading ? tCommon('loading') : t('submit')}
          </button>
        </form>

        <p className="text-center text-text-secondary text-sm mt-4 space-y-2">
          <div>
            <Link href="/auth/forgot-password" className="text-ice hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="font-rajdhani">
            {t('noAccount')}{' '}
            <Link href="/auth/register" className="text-purple hover:underline font-medium">
              {tCommon('register')}
            </Link>
          </div>
        </p>
      </div>
    </div>
  );
}

