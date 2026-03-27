'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Database, Mail, Shield, Server } from 'lucide-react';

export function AdminSettings() {
  const t = useTranslations('admin.settings');

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-purple" size={32} />
        <h1 className="text-4xl font-bold text-purple font-orbitron">
          {t('title')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-neon-green" size={24} />
            <h2 className="text-xl font-bold text-white">Database</h2>
          </div>
          <div className="space-y-2 text-text-secondary">
            <p className="text-sm">Connection: PostgreSQL</p>
            <p className="text-sm">Status: Connected</p>
            <p className="text-sm">Backups: Automated daily</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">{t('emailService')}</h2>
          </div>
          <div className="space-y-2 text-text-secondary">
            <p className="text-sm">Provider: SMTP / AWS SES</p>
            <p className="text-sm">Status: Configured</p>
            <p className="text-sm">{t('fromLabel')}: {process.env.NEXT_PUBLIC_EMAIL_FROM || t('notSet')}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-red-400" size={24} />
            <h2 className="text-xl font-bold text-white">Security</h2>
          </div>
          <div className="space-y-2 text-text-secondary">
            <p className="text-sm">Rate Limiting: Enabled</p>
            <p className="text-sm">CORS: Configured</p>
            <p className="text-sm">Input Sanitization: Active</p>
            <p className="text-sm">SSL/TLS: Enabled</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-white">System</h2>
          </div>
          <div className="space-y-2 text-text-secondary">
            <p className="text-sm">{t('environment')}: {process.env.NODE_ENV || 'production'}</p>
            <p className="text-sm">Node.js: v22</p>
            <p className="text-sm">Next.js: 15.5.9</p>
            <p className="text-sm">Prisma: 5.19.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
