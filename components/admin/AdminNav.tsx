'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  BookOpen,
  Mail,
  Send,
  Mailbox,
  Globe,
  Briefcase,
  FileCheck,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const MOBILE_BREAKPOINT = 768;
const MIN_TOUCH = 44;

export function AdminNav() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as 'tr' | 'en';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/mdijital-logo-white.webp');
  const [logoError, setLogoError] = useState(false);

  const checkMobile = useCallback(() => {
    const m = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(m);
    if (!m) {
      setMobileOpen(false);
      setMoreOpen(false);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLogoSrc(window.location.origin + '/mdijital-logo-white.webp');
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen, isMobile]);

  const adminBase = typeof window !== 'undefined' && window.location.hostname === 'admin.mdijital.io' ? '' : '/admin';
  const basePath = adminBase || '/';

  const mainNav = [
    { href: basePath, icon: LayoutDashboard, label: tAdmin('title') },
    { href: `${adminBase}/requests`, icon: FileText, label: tAdmin('requests.title') },
    { href: `${adminBase}/contacts`, icon: Mail, label: tAdmin('contacts.title') },
    { href: `${adminBase}/blog`, icon: BookOpen, label: tAdmin('blog.title') },
  ];

  const moreNav = [
    { href: `${adminBase}/users`, icon: Users, label: tAdmin('users') },
    { href: `${adminBase}/careers`, icon: Briefcase, label: tAdmin('careers.title') },
    { href: `${adminBase}/applications`, icon: FileCheck, label: tAdmin('applications.title') },
    { href: `${adminBase}/newsletter`, icon: Send, label: tAdmin('newsletter.title') },
    { href: `${adminBase}/email`, icon: Mailbox, label: tAdmin('email.title') },
    { href: `${adminBase}/settings`, icon: Settings, label: tAdmin('settings.title') },
  ];

  const allNav = [...mainNav, ...moreNav];

  const normalizedPath = (() => {
    const p = pathname?.replace(/^\/(tr|en)/, '') || '';
    return adminBase === '' ? (p.replace(/^\/admin/, '') || '/') : p;
  })();

  const isActive = (href: string) =>
    normalizedPath === href || (href !== '/' && normalizedPath?.startsWith(href + '/'));

  const pathWithoutLocale = (pathname?.replace(/^\/(tr|en)/, '') || '').replace(/\/$/, '') || '/';
  const currentPath = pathWithoutLocale.startsWith('/admin')
    ? pathWithoutLocale
    : pathWithoutLocale === '/' || pathWithoutLocale === ''
      ? (adminBase || '/admin')
      : `${adminBase || '/admin'}${pathWithoutLocale}`;

  const localeSwitch = (newLocale: 'tr' | 'en') => {
    if (newLocale === locale) return;
    (async () => {
      try {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredLocale: newLocale }),
        });
      } catch {
        /* ignore */
      }
      const targetPath = newLocale === 'en' ? `/en${currentPath}` : currentPath;
      if (typeof window !== 'undefined') {
        window.location.href = `${window.location.origin}${targetPath}`;
      } else {
        router.replace(targetPath);
      }
    })();
  };

  const linkEl = (item: { href: string; icon: React.ElementType; label: string }) => {
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive(item.href) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        style={{ minHeight: MIN_TOUCH }}
      >
        <Icon size={18} className="shrink-0" aria-hidden />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={basePath}
          className="flex shrink-0 items-center gap-2 text-white no-underline"
          style={{ minHeight: MIN_TOUCH }}
        >
          {!logoError && (
            <img
              src={logoSrc}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 object-contain"
              onError={() => setLogoError(true)}
            />
          )}
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            M<span className="text-purple-400">DIJITAL</span>
            <span className="ml-1.5 text-gray-500">Admin</span>
          </span>
        </Link>

        {isMobile ? (
          <>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close' : 'Menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            {mobileOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/60" aria-hidden onClick={() => setMobileOpen(false)} />
                <div
                  className="fixed top-0 right-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-l border-white/10 bg-gray-900"
                  role="dialog"
                  aria-label="Menu"
                >
                  <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <span className="text-sm font-medium text-white">Menu</span>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:text-white"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-0.5 overflow-auto p-3">
                    {allNav.map((item) => (
                      <div key={item.href} onClick={() => setMobileOpen(false)}>
                        {linkEl(item)}
                      </div>
                    ))}
                    <div className="my-3 border-t border-white/10" />
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-xs text-gray-500">Language</span>
                      <button
                        type="button"
                        onClick={() => localeSwitch('tr')}
                        className={`rounded px-2 py-1 text-sm ${locale === 'tr' ? 'bg-purple-500/30 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                      >
                        TR
                      </button>
                      <button
                        type="button"
                        onClick={() => localeSwitch('en')}
                        className={`rounded px-2 py-1 text-sm ${locale === 'en' ? 'bg-purple-500/30 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                      >
                        EN
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: typeof window !== 'undefined' ? window.location.origin + basePath : '/admin', redirect: true })}
                      className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                      style={{ minHeight: MIN_TOUCH }}
                    >
                      <LogOut size={18} />
                      {t('logout')}
                    </button>
                  </nav>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-end gap-1">
            <nav className="flex items-center gap-0.5">
              {mainNav.map((item) => linkEl(item))}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors min-h-[36px] ${
                    moreNav.some((i) => isActive(i.href)) ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                >
                  <Settings size={18} />
                  <span>{tAdmin('more')}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMoreOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-white/10 bg-gray-900 py-1 shadow-xl">
                      {moreNav.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                            isActive(item.href) ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                          onClick={() => setMoreOpen(false)}
                        >
                          <item.icon size={16} className="shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </nav>
            <div className="ml-2 h-6 w-px bg-white/20" />
            <div className="flex items-center gap-1 pl-2">
              <button
                type="button"
                onClick={() => localeSwitch('tr')}
                className={`rounded px-2 py-1.5 text-xs font-medium ${locale === 'tr' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => localeSwitch('en')}
                className={`rounded px-2 py-1.5 text-xs font-medium ${locale === 'en' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                EN
              </button>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: typeof window !== 'undefined' ? window.location.origin + basePath : '/admin', redirect: true })}
              className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
