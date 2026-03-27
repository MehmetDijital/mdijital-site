'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { FileText, Mail, Calendar } from 'lucide-react';

interface RequestData {
  id: string;
  name: string;
  projectIdea: string;
  status: string;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
  };
}

export function AdminRequestsList({ requests }: { requests: RequestData[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'ALL') return true;
    return req.status === statusFilter;
  });

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-neon-purple text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('Received')}
            className={`px-4 py-2 rounded transition-colors ${
              statusFilter === 'Received'
                ? 'bg-neon-green text-black'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Received ({requests.filter((r) => r.status === 'Received').length})
          </button>
          <button
            onClick={() => setStatusFilter('In Progress')}
            className={`px-4 py-2 rounded transition-colors ${
              statusFilter === 'In Progress'
                ? 'bg-neon-purple text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            In Progress ({requests.filter((r) => r.status === 'In Progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-4 py-2 rounded transition-colors ${
              statusFilter === 'Completed'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Completed ({requests.filter((r) => r.status === 'Completed').length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Link
            key={request.id}
            href={`/admin/requests/${request.id}`}
            className="block glass-panel p-4 rounded-lg border border-white/5 hover:border-neon-purple/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-neon-purple" size={20} />
                  <h3 className="text-lg font-bold text-white">{request.name}</h3>
                  <span
                    className={`px-3 py-1 rounded text-sm font-bold ${
                      request.status === 'Received'
                        ? 'bg-neon-green/20 text-neon-green'
                        : request.status === 'In Progress'
                        ? 'bg-neon-purple/20 text-neon-purple'
                        : 'bg-green-500/20 text-green-500'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {request.projectIdea}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail size={12} />
                    {request.user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

