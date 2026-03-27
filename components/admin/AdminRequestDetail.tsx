'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, FileText, Mail, User, Save } from 'lucide-react';

interface RequestData {
  id: string;
  name: string;
  projectIdea: string;
  timeHorizon: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export function AdminRequestDetail({ request }: { request: RequestData }) {
  const router = useRouter();
  const td = useTranslations('admin.requests.details');
  const [status, setStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 neon-text-purple">{td('title')}</h1>
      <div className="glass-panel p-8 rounded-xl border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="text-neon-purple" size={20} />
              <h3 className="text-lg font-bold text-white">{td('customer')}</h3>
            </div>
            <p className="text-gray-300">{request.user.name || td('noName')}</p>
            <div className="flex items-center gap-2 mt-2">
              <Mail size={14} className="text-gray-400" />
              <p className="text-sm text-gray-400">{request.user.email}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-neon-green" size={20} />
              <h3 className="text-lg font-bold text-white">{td('dates')}</h3>
            </div>
            <p className="text-sm text-gray-300">
              {td('created')}: {new Date(request.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-300">
              {td('updated')}: {new Date(request.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-neon-green" size={20} />
            <h3 className="text-xl font-bold text-white">{td('projectIdea')}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {request.projectIdea}
          </p>
        </div>

        {request.timeHorizon && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">{td('timeHorizon')}</h3>
            <p className="text-gray-300">{request.timeHorizon}</p>
          </div>
        )}

        <div className="space-y-4 pt-6 border-t border-white/10">
          <div>
            <label className="block text-sm font-bold text-white mb-2">{td('status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-purple outline-none transition-colors"
            >
              <option value="Received">{td('statusReceived')}</option>
              <option value="In Progress">{td('statusInProgress')}</option>
              <option value="Completed">{td('statusCompleted')}</option>
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

