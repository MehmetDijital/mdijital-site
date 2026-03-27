'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed: boolean;
  locale: string;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminNewsletterPage() {
  const t = useTranslations('admin.newsletter');
  const tCommon = useTranslations('common');
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/newsletter?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (err) {
      console.error('Failed to delete subscription:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Mail className="text-ice" size={32} />
          <h1 className="text-4xl font-bold text-ice font-orbitron">
            {t('title') || 'Newsletter Management'}
          </h1>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-lead/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quiet" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                placeholder={t('searchPlaceholder') || 'Search by email...'}
                className="w-full pl-10 pr-4 py-2 bg-graphite/80 border border-lead rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 bg-graphite/80 border border-lead rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
            >
              <option value="all">{t('all') || 'All'}</option>
              <option value="subscribed">{t('subscribed') || 'Subscribed'}</option>
              <option value="unsubscribed">{t('unsubscribed') || 'Unsubscribed'}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">{tCommon('loading')}</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">{t('noSubscriptions') || 'No subscriptions found'}</p>
          </div>
        ) : (
          <>
            <div className="glass-panel rounded-xl border border-lead/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-graphite/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider font-orbitron">
                        {t('email') || 'Email'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider font-orbitron">
                        {t('status') || 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider font-orbitron">
                        {t('locale') || 'Locale'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider font-orbitron">
                        {t('subscribedAt') || 'Subscribed At'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider font-orbitron">
                        {t('actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lead/50">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-graphite/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-text-primary font-rajdhani">
                          {sub.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {sub.subscribed ? (
                            <span className="inline-flex items-center gap-2 text-green-400">
                              <CheckCircle size={16} />
                              <span className="font-rajdhani">{t('subscribed') || 'Subscribed'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-red-400">
                              <XCircle size={16} />
                              <span className="font-rajdhani">{t('unsubscribed') || 'Unsubscribed'}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-rajdhani uppercase">
                          {sub.locale}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-rajdhani text-sm">
                          {sub.subscribedAt
                            ? new Date(sub.subscribedAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(sub.id)}
                            disabled={deleting === sub.id}
                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-text-secondary font-rajdhani">
                  {t('showing') || 'Showing'} {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} {t('of') || 'of'}{' '}
                  {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-graphite/80 border border-lead rounded text-text-primary hover:bg-graphite transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-rajdhani"
                  >
                    {t('previous') || 'Previous'}
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 bg-graphite/80 border border-lead rounded text-text-primary hover:bg-graphite transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-rajdhani"
                  >
                    {t('next') || 'Next'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
