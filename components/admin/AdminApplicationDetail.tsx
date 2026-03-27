'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  Clock,
  FileText,
  Mail,
  User,
  Save,
  Phone,
  Briefcase,
  Download,
} from 'lucide-react';

interface JobPostingRef {
  id: string;
  titleTR: string;
  titleEN: string;
}

interface ApplicationData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  coverLetter: string | null;
  cvPath: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  jobPosting: JobPostingRef;
}

export function AdminApplicationDetail({
  application,
  locale,
  cvBaseUrl = '',
}: {
  application: ApplicationData;
  locale: string;
  cvBaseUrl?: string;
}) {
  const router = useRouter();
  const td = useTranslations('admin.applications.details');
  const [status, setStatus] = useState(application.status);
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const jobTitle =
    locale === 'en' ? application.jobPosting.titleEN : application.jobPosting.titleTR;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setIsSaving(false);
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
              <h3 className="text-lg font-bold text-white">{td('applicant')}</h3>
            </div>
            <p className="text-gray-300">{application.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <Mail size={14} className="text-gray-400" />
              <p className="text-sm text-gray-400">{application.email}</p>
            </div>
            {application.phone && (
              <div className="flex items-center gap-2 mt-1">
                <Phone size={14} className="text-gray-400" />
                <p className="text-sm text-gray-400">{application.phone}</p>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="text-neon-green" size={20} />
              <h3 className="text-lg font-bold text-white">{td('job')}</h3>
            </div>
            <p className="text-gray-300">{jobTitle}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-neon-green" size={20} />
              <h3 className="text-lg font-bold text-white">{td('dates')}</h3>
            </div>
            <p className="text-sm text-gray-300">
              {td('createdAt')}: {new Date(application.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-300">
              {td('updatedAt')}: {new Date(application.updatedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-neon-purple" size={20} />
              <h3 className="text-lg font-bold text-white">{td('cv')}</h3>
            </div>
            <a
              href={cvBaseUrl ? `${cvBaseUrl.replace(/\/$/, '')}${application.cvPath}` : application.cvPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/30 transition-colors text-sm font-rajdhani"
            >
              <Download size={16} />
              {td('downloadCv')}
            </a>
          </div>
        </div>

        {application.coverLetter && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-neon-purple" size={20} />
              <h3 className="text-lg font-bold text-white">{td('coverLetter')}</h3>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap font-rajdhani">
              {application.coverLetter}
            </p>
          </div>
        )}

        <div className="border-t border-white/10 pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 font-rajdhani">
              {td('status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full max-w-xs px-4 py-2 rounded bg-white/5 border border-white/10 text-white font-rajdhani focus:border-neon-purple focus:outline-none"
            >
              <option value="New">{td('statusNew')}</option>
              <option value="In Progress">{td('statusInProgress')}</option>
              <option value="Hired">{td('statusHired')}</option>
              <option value="Rejected">{td('statusRejected')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 font-rajdhani">
              {td('adminNotes')}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              placeholder={td('placeholderAdminNotes')}
              className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-white font-rajdhani placeholder-gray-500 focus:border-neon-purple focus:outline-none resize-y"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-purple text-white rounded hover:bg-neon-purple/80 transition-colors font-rajdhani disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? td('saving') : td('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
