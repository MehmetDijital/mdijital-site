'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Mail, FileText, AlertCircle, Users, UserCheck } from 'lucide-react';

type Mode = 'single' | 'all' | 'selected';

export function AdminEmailSender() {
  const t = useTranslations('admin.email');
  const [mode, setMode] = useState<Mode>('single');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successBulk, setSuccessBulk] = useState<{ sent: number; failed: number } | null>(null);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string }[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const res = await fetch('/api/admin/newsletter?status=subscribed&limit=500');
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.subscriptions || []).filter((s: { subscribed?: boolean }) => s.subscribed !== false);
      setSubscribers(list.map((s: { id: string; email: string }) => ({ id: s.id, email: s.email })));
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'selected') {
      fetchSubscribers();
    }
  }, [mode, fetchSubscribers]);

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedEmails.size === subscribers.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(subscribers.map((s) => s.email)));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSuccessBulk(null);
    setIsSending(true);

    try {
      if (mode === 'single') {
        const response = await fetch('/api/admin/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: to.trim(),
            subject: subject.trim(),
            message: message.trim(),
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || t('errorSendFailed'));
          return;
        }
        setSuccess(true);
        setTo('');
        setSubject('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const response = await fetch('/api/admin/email/bulk-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: mode === 'all' ? 'all' : 'selected',
            emails: mode === 'selected' ? Array.from(selectedEmails) : undefined,
            subject: subject.trim(),
            message: message.trim(),
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || t('errorSendFailed'));
          return;
        }
        setSuccessBulk({ sent: data.sent ?? 0, failed: data.failed ?? 0 });
        setSubject('');
        setMessage('');
        if (mode === 'selected') setSelectedEmails(new Set());
        setTimeout(() => setSuccessBulk(null), 8000);
      }
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsSending(false);
    }
  };

  const canSubmit =
    !!subject.trim() &&
    !!message.trim() &&
    (mode === 'single' ? !!to.trim() : mode === 'all' ? true : selectedEmails.size > 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Mail className="text-ice" size={32} />
        <h1 className="text-4xl font-bold text-ice font-orbitron">{t('title')}</h1>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-white/20 max-w-2xl">
        {error && (
          <div className="mb-6 bg-red-500/20 border-2 border-red-500/50 text-red-400 p-4 rounded flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500/50 text-green-400 p-4 rounded flex items-center gap-2">
            <Send size={20} />
            <span>{t('successSingle')}</span>
          </div>
        )}

        {successBulk && (
          <div className="mb-6 bg-green-500/20 border-2 border-green-500/50 text-green-400 p-4 rounded flex items-center gap-2">
            <Send size={20} />
            <span>{t('successBulk', { sent: successBulk.sent, failed: successBulk.failed })}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <span className="block text-sm font-bold text-white mb-2">{t('selectRecipients')}</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'single'}
                  onChange={() => setMode('single')}
                  className="text-neon-purple"
                />
                <Mail size={16} />
                <span>{t('modeSingle')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'all'}
                  onChange={() => setMode('all')}
                  className="text-neon-purple"
                />
                <Users size={16} />
                <span>{t('modeAll')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'selected'}
                  onChange={() => setMode('selected')}
                  className="text-neon-purple"
                />
                <UserCheck size={16} />
                <span>{t('modeSelected')}</span>
              </label>
            </div>
          </div>

          {mode === 'single' && (
            <div>
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Mail size={16} />
                {t('to')}
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
                placeholder={t('placeholderTo')}
              />
            </div>
          )}

          {mode === 'selected' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{t('selectRecipients')}</span>
                <button
                  type="button"
                  onClick={loadingSubs ? undefined : fetchSubscribers}
                  disabled={loadingSubs}
                  className="text-sm text-neon-purple hover:underline disabled:opacity-50"
                >
                  {loadingSubs ? t('loadingSubscribers') : t('loadSubscribers')}
                </button>
              </div>
              {subscribers.length === 0 && !loadingSubs && (
                <p className="text-gray-400 text-sm">{t('noSubscribers')}</p>
              )}
              {subscribers.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-gray-400 hover:text-white mb-2"
                  >
                    {selectedEmails.size === subscribers.length ? t('deselectAll') : t('selectAll')}
                  </button>
                  <div className="max-h-48 overflow-auto border border-gray-700 rounded p-2 space-y-1">
                    {subscribers.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedEmails.has(s.email)}
                          onChange={() => toggleEmail(s.email)}
                          className="text-neon-purple rounded"
                        />
                        <span className="text-gray-300">{s.email}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('selectedCount', { count: selectedEmails.size })}
                  </p>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileText size={16} />
              {t('subject')}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
              placeholder={t('placeholderSubject')}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">{t('message')}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors font-rajdhani"
              placeholder={t('placeholderMessage')}
              maxLength={10000}
            />
            <p className="text-xs text-gray-400 mt-2">{message.length} / 10000 characters</p>
          </div>

          <button
            type="submit"
            disabled={isSending || !canSubmit}
            className="w-full py-3 bg-neon-purple text-white font-bold uppercase tracking-widest hover:bg-opacity-80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {isSending ? t('sending') : t('send')}
          </button>
        </form>
      </div>
    </div>
  );
}
