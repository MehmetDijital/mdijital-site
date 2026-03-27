'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, FileText, Mail, User, Save, Send, MessageSquare } from 'lucide-react';

interface ContactData {
  id: string;
  name: string | null;
  email: string | null;
  projectIdea: string;
  timeHorizon: string | null;
  thresholdQuestion: string;
  status: string;
  adminNotes: string | null;
  repliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function contactStatusKey(s: string): string {
  if (s === 'New') return 'new';
  if (s === 'In Progress') return 'inProgress';
  if (s === 'Replied') return 'replied';
  if (s === 'Archived') return 'archived';
  return s;
}

export function AdminContactDetail({ contact }: { contact: ContactData }) {
  const router = useRouter();
  const t = useTranslations('admin.contacts');
  const td = useTranslations('admin.contacts.details');
  const tCareers = useTranslations('admin.careers');
  const [status, setStatus] = useState(contact.status);
  const [adminNotes, setAdminNotes] = useState(contact.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyNotification, setReplyNotification] = useState<'success' | 'error' | null>(null);
  const [saveNotification, setSaveNotification] = useState<'success' | 'error' | null>(null);

  const handleSave = async () => {
    setSaveNotification(null);
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (response.ok) {
        setSaveNotification('success');
        router.refresh();
        setTimeout(() => setSaveNotification(null), 3000);
      } else {
        setSaveNotification('error');
        setTimeout(() => setSaveNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      setSaveNotification('error');
      setTimeout(() => setSaveNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!contact.email || !replySubject.trim() || !replyMessage.trim()) {
      return;
    }

    setReplyNotification(null);
    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: replySubject.trim(),
          message: replyMessage.trim(),
        }),
      });

      if (response.ok) {
        setReplyNotification('success');
        setShowReplyForm(false);
        setReplySubject('');
        setReplyMessage('');
        router.refresh();
        setTimeout(() => setReplyNotification(null), 4000);
      } else {
        setReplyNotification('error');
        setTimeout(() => setReplyNotification(null), 4000);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyNotification('error');
      setTimeout(() => setReplyNotification(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 neon-text-purple">{td('title')}</h1>
      
      <div className="glass-panel p-8 rounded-xl border border-white/20 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="text-neon-purple" size={20} />
              <h3 className="text-lg font-bold text-white">{td('contactInfo')}</h3>
            </div>
            <p className="text-gray-300">{contact.name || t('noName')}</p>
            {contact.email && (
              <div className="flex items-center gap-2 mt-2">
                <Mail size={14} className="text-gray-400" />
                <p className="text-sm text-gray-400">{contact.email}</p>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-neon-green" size={20} />
              <h3 className="text-lg font-bold text-white">{td('dates')}</h3>
            </div>
            <p className="text-sm text-gray-300">
              Created: {new Date(contact.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-300">
              Updated: {new Date(contact.updatedAt).toLocaleString()}
            </p>
            {contact.repliedAt && (
              <p className="text-sm text-green-400">
                {td('replied')}: {new Date(contact.repliedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-neon-green" size={20} />
            <h3 className="text-xl font-bold text-white">{td('projectIdea')}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {contact.projectIdea}
          </p>
        </div>

        {contact.timeHorizon && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">{td('timeHorizon')}</h3>
            <p className="text-gray-300">{contact.timeHorizon}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{td('thresholdQuestion')}</h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {contact.thresholdQuestion}
          </p>
        </div>
      </div>

      {(replyNotification || saveNotification) && (
        <div className={`mb-6 p-4 rounded-xl border ${(replyNotification || saveNotification) === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}>
          {replyNotification ? (replyNotification === 'success' ? td('replySent') : td('replyError')) : saveNotification === 'success' ? td('saved') : td('saveError')}
        </div>
      )}
      {contact.email && (
        <div className="glass-panel p-8 rounded-xl border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-neon-purple" size={20} />
              <h3 className="text-xl font-bold text-white">{td('reply')}</h3>
            </div>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="px-4 py-2 bg-neon-purple text-white rounded hover:bg-opacity-80 transition-colors"
            >
              {showReplyForm ? tCareers('cancel') : td('reply')}
            </button>
          </div>

          {showReplyForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">{td('replySubject')}</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
                  placeholder={td('placeholderSubject')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">{td('replyMessage')}</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
                  placeholder={td('placeholderMessage')}
                />
              </div>
              <button
                onClick={handleSendReply}
                disabled={isSending || !replySubject.trim() || !replyMessage.trim()}
                className="w-full py-3 bg-neon-green text-black font-bold uppercase tracking-widest hover:bg-opacity-80 transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {isSending ? td('sending') : td('sendReply')}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="glass-panel p-8 rounded-xl border border-white/20">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">{td('status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
            >
              <option value="New">{t('status.new')}</option>
              <option value="In Progress">{t('status.inProgress')}</option>
              <option value="Replied">{t('status.replied')}</option>
              <option value="Archived">{t('status.archived')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">{td('adminNotes')}</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={6}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
              placeholder={td('placeholderAdminNotes')}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-neon-purple text-white font-bold uppercase tracking-widest hover:bg-opacity-80 transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isSaving ? td('saving') : td('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
