'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { getCsrfToken } from '@/lib/csrf-client';

export default function NewsletterPage() {
  const t = useTranslations('dashboard.newsletter');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checkStatus = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(`/api/newsletter?email=${encodeURIComponent(session.user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setSubscribed(data.subscribed || false);
      }
    } catch (err) {
      console.error('Failed to check newsletter status:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      checkStatus();
    }
  }, [session?.user?.email, checkStatus]);

  const handleToggle = async () => {
    if (!session?.user?.email) return;

    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const locale = window.location.pathname.split('/')[1] || 'tr';
      const action = subscribed ? 'unsubscribe' : 'subscribe';

      let response;
      if (action === 'unsubscribe') {
        const statusResponse = await fetch(`/api/newsletter?email=${encodeURIComponent(session.user.email)}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (!statusData.subscribed) {
            setError(t('alreadyUnsubscribed'));
            setUpdating(false);
            return;
          }
        }
        const token = await getCsrfToken();
        response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token,
          },
          body: JSON.stringify({
            action: 'unsubscribe',
            email: session.user.email,
            locale,
          }),
        });
      } else {
        const token = await getCsrfToken();
        response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token,
          },
          body: JSON.stringify({
            action: 'subscribe',
            email: session.user.email,
            locale,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('updateError'));
        return;
      }

      setSubscribed(!subscribed);
      setSuccess(subscribed ? t('unsubscribedSuccess') : t('subscribedSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-ice font-orbitron">
          {t('title')}
        </h1>

        <div className="glass-panel p-6 rounded-xl border border-lead/50">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-ice" size={24} />
            <h2 className="text-2xl font-bold text-text-primary font-orbitron">
              {t('subscription')}
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded text-sm mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-graphite/50 rounded-lg">
              <div className="flex items-center gap-3">
                {subscribed ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <XCircle className="text-red-500" size={24} />
                )}
                <div>
                  <p className="text-text-primary font-semibold font-rajdhani">
                    {subscribed ? t('subscribed') : t('notSubscribed')}
                  </p>
                  <p className="text-text-secondary text-sm font-rajdhani">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={updating}
              className={`w-full py-3 font-bold uppercase tracking-widest transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron ${
                subscribed
                  ? 'bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30'
                  : 'bg-ice text-obsidian hover:bg-ice/80'
              }`}
            >
              {updating
                ? tCommon('loading')
                : subscribed
                ? t('unsubscribe')
                : t('subscribe')}
            </button>

            <p className="text-text-quiet text-sm font-rajdhani">
              {t('description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
