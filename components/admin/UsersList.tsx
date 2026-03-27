'use client';

import { useState } from 'react';
import { User, Shield, UserCircle, Mail, Calendar } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  _count: {
    projectRequests: number;
  };
}

export function UsersList({ users }: { users: UserData[] }) {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredUsers = users.filter((user) => {
    if (selectedRole === 'ALL') return true;
    return user.role === selectedRole;
  });

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-4 py-2 rounded transition-colors ${
              selectedRole === 'ALL'
                ? 'bg-neon-purple text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setSelectedRole('ADMIN')}
            className={`px-4 py-2 rounded transition-colors ${
              selectedRole === 'ADMIN'
                ? 'bg-neon-purple text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Admins ({users.filter((u) => u.role === 'ADMIN').length})
          </button>
          <button
            onClick={() => setSelectedRole('CUSTOMER')}
            className={`px-4 py-2 rounded transition-colors ${
              selectedRole === 'CUSTOMER'
                ? 'bg-neon-purple text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Customers ({users.filter((u) => u.role === 'CUSTOMER').length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="glass-panel p-4 rounded-lg border border-white/5 hover:border-neon-purple/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-neon-purple/10">
                  {user.role === 'ADMIN' ? (
                    <Shield className="text-neon-purple" size={24} />
                  ) : (
                    <UserCircle className="text-neon-green" size={24} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {user.name || 'No Name'}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-neon-purple/20 text-neon-purple'
                          : 'bg-neon-green/20 text-neon-green'
                      }`}
                    >
                      {user.role}
                    </span>
                    {!user.isActive && (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {user._count.projectRequests} requests
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

