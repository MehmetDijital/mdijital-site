'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, FileText, LogOut, Shield, User, Mail } from 'lucide-react';

export function DashboardNav() {
  const t = useTranslations('common');
  const tD = useTranslations('dashboard');
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-lead/50 backdrop-blur-sm bg-obsidian/80">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link 
            href={isAdmin ? '/admin' : '/dashboard'} 
            className="text-2xl font-bold text-text-primary font-orbitron hover:text-ice transition-colors"
          >
            M<span className="text-ice">DIJITAL</span>
          </Link>
          <button
            onClick={() => {
              const callbackUrl = pathname?.startsWith('/en') ? '/en' : '/';
              signOut({ callbackUrl, redirect: true });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-ice hover:bg-ice/10 transition-all font-rajdhani"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {isAdmin ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple bg-purple/10 font-rajdhani whitespace-nowrap transition-all hover:bg-purple/20"
            >
              <Shield size={18} />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-rajdhani whitespace-nowrap ${
                  pathname === '/dashboard' || pathname?.endsWith('/dashboard')
                    ? 'text-ice bg-ice/20 border border-ice/30'
                    : 'text-text-secondary hover:text-ice hover:bg-ice/10'
                }`}
              >
                <LayoutDashboard size={18} />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link
                href="/dashboard/requests/new"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-rajdhani whitespace-nowrap ${
                  pathname?.includes('/dashboard/requests/new')
                    ? 'text-ice bg-ice/20 border border-ice/30'
                    : 'text-text-secondary hover:text-ice hover:bg-ice/10'
                }`}
              >
                <FileText size={18} />
                <span className="text-sm font-medium">New Request</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-rajdhani whitespace-nowrap ${
                  pathname?.includes('/dashboard/profile')
                    ? 'text-ice bg-ice/20 border border-ice/30'
                    : 'text-text-secondary hover:text-ice hover:bg-ice/10'
                }`}
              >
                <User size={18} />
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <Link
                href="/dashboard/newsletter"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-rajdhani whitespace-nowrap ${
                  pathname?.includes('/dashboard/newsletter')
                    ? 'text-ice bg-ice/20 border border-ice/30'
                    : 'text-text-secondary hover:text-ice hover:bg-ice/10'
                }`}
              >
                <Mail size={18} />
                <span className="text-sm font-medium">{tD('newsletter.title')}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
