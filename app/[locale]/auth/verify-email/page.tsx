'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const t = useTranslations('auth.verifyEmail');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isEmailFromUrl, setIsEmailFromUrl] = useState(false);

  // Get email from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setEmail(decodedEmail);
      setIsEmailFromUrl(true);
    }
  }, [searchParams]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedCode = code.trim().replace(/\D/g, '').slice(0, 6);

      if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
        setError('Invalid email address');
        setIsLoading(false);
        return;
      }

      if (sanitizedCode.length !== 6) {
        setError('Verification code must be 6 digits');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify-email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: sanitizedEmail, 
          code: sanitizedCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('verifyError'));
        return;
      }

      if (data.loginToken) {
        try {
          const loginResponse = await fetch('/api/auth/verify-email/auto-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: sanitizedEmail,
              loginToken: data.loginToken,
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok && loginData.success) {
            setSuccess(t('verifySuccess'));
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1000);
            return;
          }
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
        }
      }

      setSuccess(t('verifySuccess'));
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      const locale = window.location.pathname.split('/')[1] || 'tr';
      const response = await fetch('/api/auth/verify-email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('resendError'));
        return;
      }

      // In development mode, show verification code
      if (data.devMode && data.verificationCode) {
        alert(`Development Mode: Verification Code: ${data.verificationCode}`);
        setSuccess(t('resendSuccess') + ` (Code: ${data.verificationCode})`);
      } else {
        setSuccess(t('resendSuccess'));
      }
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pointer-events-auto relative z-50">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-lead/50 pointer-events-auto relative z-50">
        <div className="text-center mb-8">
          <Mail className="text-5xl text-purple mx-auto mb-4" size={48} />
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

        <form onSubmit={handleVerify} className="space-y-4 pointer-events-auto relative z-50">
          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-purple outline-none transition-colors font-rajdhani pointer-events-auto"
              required
              disabled={isEmailFromUrl}
            />
          </div>

          <div className="pointer-events-auto">
            <label className="block text-sm text-text-secondary mb-2 font-rajdhani">{t('code')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-purple outline-none transition-colors text-center text-2xl tracking-widest font-mono pointer-events-auto"
              placeholder="000000"
              maxLength={6}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full py-3 bg-purple text-text-primary font-bold uppercase tracking-widest hover:bg-purple/80 transition-colors rounded disabled:opacity-50 font-orbitron pointer-events-auto"
          >
            {isLoading ? t('verifying') : t('verify')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="text-purple hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto font-rajdhani"
          >
            <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
            {countdown > 0
              ? t('resendCountdown', { seconds: countdown })
              : t('resendCode')}
          </button>
        </div>
      </div>
    </div>
  );
}

