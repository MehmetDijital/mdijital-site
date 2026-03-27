'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useSession, signOut } from 'next-auth/react';
import { Languages, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    if (showLangMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLangMenu]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['gok', 'mimari', 'alanlar', 'temas'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Handle hash navigation when coming from other pages
    const hash = window.location.hash.slice(1);
    if (hash && ['gok', 'mimari', 'alanlar', 'temas'].includes(hash)) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    // Check if we're on the home page
    const isHomePage = pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;
    
    if (isHomePage) {
      // If we're on the home page, just scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // If we're on a different page, navigate to home with hash
      const homePath = locale === 'tr' ? '/' : `/${locale}`;
      router.push(`${homePath}#${sectionId}`);
      
      // Wait for navigation and then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const navItems = [
    { id: 'gok', label: locale === 'tr' ? 'GÖK' : 'SKY' },
    { id: 'mimari', label: locale === 'tr' ? 'MİMARİ' : 'Architecture' },
    { id: 'alanlar', label: locale === 'tr' ? 'Alanlar' : 'Fields' },
    { id: 'temas', label: locale === 'tr' ? 'NOXARA' : 'NOXARA' },
  ];

  const isDashboardOrAdmin = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  return (
    <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/mdijital-logo-white.webp"
            alt="M Dijital - Akıllı Sistemler. İnsan Merkezli Gelecek."
            width={200}
            height={32}
            className="h-8 w-auto"
            priority
            unoptimized
          />
        </Link>
        {!isDashboardOrAdmin && (
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`text-sm uppercase font-medium transition-colors ${
                  activeSection === item.id
                    ? 'text-ice'
                    : 'text-text-secondary hover:text-ice'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      <div className="pointer-events-auto flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="text-text-primary hover:text-ice transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-graphite/30"
            aria-label="Change language"
            aria-expanded={showLangMenu}
          >
            <Languages size={18} />
            <span className="text-sm uppercase font-medium">{locale}</span>
          </button>
          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 glass-panel rounded-lg p-1 min-w-[120px] shadow-lg border border-lead/50">
              <Link
                href={pathname}
                locale="tr"
                onClick={() => setShowLangMenu(false)}
                className={`block w-full px-4 py-2 text-left text-sm uppercase font-medium rounded transition-colors ${
                  locale === 'tr'
                    ? 'text-ice bg-graphite/30'
                    : 'text-text-primary hover:text-ice hover:bg-graphite/30'
                }`}
              >
                TR
              </Link>
              <Link
                href={pathname}
                locale="en"
                onClick={() => setShowLangMenu(false)}
                className={`block w-full px-4 py-2 text-left text-sm uppercase font-medium rounded transition-colors ${
                  locale === 'en'
                    ? 'text-ice bg-graphite/30'
                    : 'text-text-primary hover:text-ice hover:bg-graphite/30'
                }`}
              >
                EN
              </Link>
            </div>
          )}
        </div>
        {!isDashboardOrAdmin && (
          <>
            {session ? (
              <>
                <Link
                  href={session.user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="text-text-primary hover:text-ice transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-graphite/30"
                >
                  <LayoutDashboard size={18} />
                  <span className="text-sm font-medium">{session.user?.role === 'ADMIN' ? t('admin') : t('dashboard')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const callbackUrl = locale === 'en' ? '/en' : '/';
                    signOut({ callbackUrl, redirect: true });
                  }}
                  className="text-text-primary hover:text-ice transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-graphite/30"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">{t('logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="text-text-primary hover:text-purple transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-graphite/30"
                >
                  <span className="text-sm font-medium">{t('register')}</span>
                </Link>
                <Link
                  href="/auth/login"
                  className="text-text-primary hover:text-ice transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-graphite/30"
                >
                  <LogIn size={18} />
                  <span className="text-sm font-medium">{t('login')}</span>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}

