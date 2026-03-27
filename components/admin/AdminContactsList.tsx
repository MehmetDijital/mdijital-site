'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Mail, Calendar, User } from 'lucide-react';

function contactStatusLabel(status: string, t: (k: string) => string): string {
  if (status === 'all') return t('all');
  if (status === 'New') return t('status.new');
  if (status === 'In Progress') return t('status.inProgress');
  if (status === 'Replied') return t('status.replied');
  if (status === 'Archived') return t('status.archived');
  return status;
}

interface ContactData {
  id: string;
  name: string | null;
  email: string | null;
  projectIdea: string;
  status: string;
  createdAt: Date;
}

export function AdminContactsList({ initialContacts }: { initialContacts: ContactData[] }) {
  const t = useTranslations('admin.contacts');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contacts] = useState(initialContacts);

  const filteredContacts = contacts.filter((contact) => {
    if (statusFilter === 'all') return true;
    return contact.status === statusFilter;
  });

  const statusCounts = {
    all: contacts.length,
    New: contacts.filter((c) => c.status === 'New').length,
    'In Progress': contacts.filter((c) => c.status === 'In Progress').length,
    Replied: contacts.filter((c) => c.status === 'Replied').length,
    Archived: contacts.filter((c) => c.status === 'Archived').length,
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 neon-text-purple">{t('title')}</h1>
      
      <div className="glass-panel p-6 rounded-xl border border-white/10 mb-6">
        <div className="flex gap-4 flex-wrap">
          {(['all', 'New', 'In Progress', 'Replied', 'Archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded transition-colors font-rajdhani ${
                statusFilter === status
                  ? status === 'all'
                    ? 'bg-neon-purple text-white'
                    : status === 'New'
                    ? 'bg-neon-green text-black'
                    : status === 'In Progress'
                    ? 'bg-yellow-500 text-black'
                    : status === 'Replied'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {contactStatusLabel(status, t)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400">{t('noContacts')}</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/admin/contacts/${contact.id}`}
              className="block glass-panel p-4 rounded-lg border border-white/5 hover:border-neon-purple/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="text-neon-purple" size={20} />
                    <h3 className="text-lg font-bold text-white">
                      {contact.name || contact.email || t('anonymous')}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        contact.status === 'New'
                          ? 'bg-neon-green/20 text-neon-green'
                          : contact.status === 'In Progress'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : contact.status === 'Replied'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {contactStatusLabel(contact.status, t)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {contact.projectIdea}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        {contact.email}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
