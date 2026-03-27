'use client';

import { Users, FileText, Clock, CheckCircle, Mail, BookOpen, Send } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Stats {
  totalUsers: number;
  totalRequests: number;
  received: number;
  inProgress: number;
  completed: number;
  totalContacts: number;
  newContacts: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  newsletterSubscribers: number;
}

interface RecentRequest {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  };
}

interface RecentContact {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  createdAt: string;
}

function requestStatusKey(s: string): string {
  if (s === 'Received') return 'statusReceived';
  if (s === 'In Progress') return 'statusInProgress';
  if (s === 'Completed') return 'statusCompleted';
  return s;
}

function contactStatusKey(s: string): string {
  if (s === 'New') return 'statusNew';
  if (s === 'In Progress') return 'statusInProgress';
  if (s === 'Replied') return 'statusReplied';
  if (s === 'Archived') return 'statusArchived';
  return s;
}

export function AdminDashboard({
  stats,
  recentRequests,
  recentContacts,
}: {
  stats: Stats;
  recentRequests: RecentRequest[];
  recentContacts: RecentContact[];
}) {
  const t = useTranslations('admin');
  const td = useTranslations('admin.dashboard');

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 neon-text-purple">{t('title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.totalUsers')}</h3>
            <Users className="text-neon-green" size={24} />
          </div>
          <p className="text-3xl font-bold text-neon-green">{stats.totalUsers}</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.totalRequests')}</h3>
            <FileText className="text-neon-purple" size={24} />
          </div>
          <p className="text-3xl font-bold text-neon-purple">{stats.totalRequests}</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.newContacts')}</h3>
            <Mail className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.newContacts}</p>
          <p className="text-xs text-gray-400 mt-1">{td('totalLabel')}: {stats.totalContacts}</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.publishedPosts')}</h3>
            <BookOpen className="text-purple-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-400">{stats.publishedBlogPosts}</p>
          <p className="text-xs text-gray-400 mt-1">{td('totalLabel')}: {stats.totalBlogPosts}</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.inProgress')}</h3>
            <Clock className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-500">{stats.inProgress}</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.completed')}</h3>
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('stats.newsletter')}</h3>
            <Send className="text-cyan-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-cyan-400">{stats.newsletterSubscribers}</p>
          <p className="text-xs text-gray-400 mt-1">{t('stats.subscribers')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{td('recentRequests')}</h2>
            <Link
              href="/admin/requests"
              className="text-neon-purple hover:underline text-sm min-h-[44px] flex items-center touch-manipulation cursor-pointer"
            >
              {td('viewAll')}
            </Link>
          </div>
          <div className="space-y-4">
            {recentRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{td('noRequestsYet')}</p>
            ) : (
              recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/requests/${request.id}`}
                  className="block glass-panel p-4 rounded-lg border border-white/5 hover:border-neon-purple/50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{request.name}</h3>
                      <p className="text-sm text-gray-400">{request.user.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded text-sm font-bold ${
                          request.status === 'Received'
                            ? 'bg-neon-green/20 text-neon-green'
                            : request.status === 'In Progress'
                            ? 'bg-neon-purple/20 text-neon-purple'
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {td(requestStatusKey(request.status))}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-white/10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{td('recentContacts')}</h2>
            <Link
              href="/admin/contacts"
              className="text-blue-400 hover:underline text-sm min-h-[44px] flex items-center touch-manipulation cursor-pointer"
            >
              {td('viewAll')}
            </Link>
          </div>
          <div className="space-y-4">
            {recentContacts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{td('noContactsYet')}</p>
            ) : (
              recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/admin/contacts/${contact.id}`}
                  className="block glass-panel p-4 rounded-lg border border-white/5 hover:border-blue-400/50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {contact.name || contact.email || td('anonymous')}
                      </h3>
                      {contact.email && (
                        <p className="text-sm text-gray-400">{contact.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded text-sm font-bold ${
                          contact.status === 'New'
                            ? 'bg-neon-green/20 text-neon-green'
                            : contact.status === 'In Progress'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : contact.status === 'Replied'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}
                      >
                        {td(contactStatusKey(contact.status))}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

