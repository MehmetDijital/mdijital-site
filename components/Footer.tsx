'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { getCsrfToken } from '@/lib/csrf-client';
import { 
  Github, 
  Linkedin, 
  Instagram,
  Send,
  Code,
  Smartphone,
  Network,
  Brain,
  Gamepad2,
  FileText,
  HelpCircle,
  BookOpen,
  Users,
  Briefcase,
  FolderOpen
} from 'lucide-react';
import { useState } from 'react';

export function Footer() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())) {
      setError('Invalid email address');
      setIsLoading(false);
      return;
    }

    try {
      const token = await getCsrfToken();
      const locale = window.location.pathname.split('/')[1] || 'tr';
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify({
          action: 'subscribe',
          email: email.trim().toLowerCase(),
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError(data.error || 'Failed to subscribe');
        }
        return;
      }

      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="relative mt-32 border-t border-lead/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-panel/50 to-dark-bg"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <Image
                src="/mdijital-logo-white.webp"
                alt="M Dijital - Akıllı Sistemler. İnsan Merkezli Gelecek."
                width={200}
                height={40}
                className="h-10 w-auto"
                unoptimized
              />
              <span className="text-text-primary font-orbitron text-2xl font-bold tracking-wider">MDIJITAL</span>
            </Link>
            <p className="text-text-secondary mb-6 max-w-md leading-relaxed">
              {t('tagline')}
            </p>
            

            <div className="mt-8">
              <div className="flex gap-4">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-text-secondary hover:text-ice hover:border-ice/50 transition-all border border-lead/50"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-white hover:text-purple hover:border-purple/50 transition-all border border-lead/50"
                  aria-label="X (formerly Twitter)"
                >
                  <Image
                    src="/x-logo.svg"
                    alt="X (formerly Twitter)"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </a>
                <a 
                  href="https://www.linkedin.com/company/m-dijital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-text-secondary hover:text-ice hover:border-ice/50 transition-all border border-lead/50"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/mdijital_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center text-text-secondary hover:text-purple hover:border-purple/50 transition-all border border-lead/50"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-text-primary font-orbitron text-lg mb-6 flex items-center gap-2">
              <Users size={20} className="text-ice" />
              {t('company.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <FileText size={14} />
                  {t('company.about')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <Briefcase size={14} />
                  {t('company.services')}
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <FolderOpen size={14} />
                  {t('company.projects')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <Briefcase size={14} />
                  {t('company.careers')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-text-primary font-orbitron text-lg mb-6 flex items-center gap-2">
              <Code size={20} className="text-purple" />
              {t('services.title')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/web" className="text-text-secondary hover:text-purple transition-colors text-sm flex items-center gap-2">
                  <Code size={14} />
                  {t('services.web')}
                </Link>
              </li>
              <li>
                <Link href="/services/mobile" className="text-text-secondary hover:text-purple transition-colors text-sm flex items-center gap-2">
                  <Smartphone size={14} />
                  {t('services.mobile')}
                </Link>
              </li>
              <li>
                <Link href="/services/architecture" className="text-text-secondary hover:text-purple transition-colors text-sm flex items-center gap-2">
                  <Network size={14} />
                  {t('services.architecture')}
                </Link>
              </li>
              <li>
                <Link href="/services/ai" className="text-text-secondary hover:text-purple transition-colors text-sm flex items-center gap-2">
                  <Brain size={14} />
                  {t('services.ai')}
                </Link>
              </li>
              <li>
                <Link href="/services/gameDevelopment" className="text-text-secondary hover:text-purple transition-colors text-sm flex items-center gap-2">
                  <Gamepad2 size={14} />
                  {t('services.gameDevelopment')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-text-primary font-orbitron text-lg mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-ice" />
              {t('resources.title')}
            </h3>
            <ul className="space-y-3 mb-8">
              <li>
                <Link href="/blog" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <FileText size={14} />
                  {t('resources.blog')}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <HelpCircle size={14} />
                  {t('resources.support')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-text-secondary hover:text-ice transition-colors text-sm flex items-center gap-2">
                  <HelpCircle size={14} />
                  {t('resources.faq')}
                </Link>
              </li>
            </ul>

            <div>
              <h4 className="text-text-primary font-orbitron text-sm mb-4">{t('newsletter.title')}</h4>
              <p className="text-text-quiet text-xs mb-4">{t('newsletter.subtitle')}</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="flex-1 px-4 py-2 glass-panel border border-lead/50 rounded-lg text-text-primary placeholder-text-quiet focus:outline-none focus:border-ice/50 transition-colors text-sm"
                  required
                  disabled={isLoading || subscribed}
                />
                <button
                  type="submit"
                  disabled={isLoading || subscribed || !email}
                  className="px-4 py-2 bg-ice text-obsidian font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-ice/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
              {error && (
                <p className="text-red-400 text-xs mt-2">
                  {error}
                </p>
              )}
              {subscribed && (
                <p className="text-ice text-xs mt-2 animate-pulse">
                  ✓ {t('newsletter.subscribed') || 'Subscribed!'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-lead/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-text-quiet text-sm text-center md:text-left font-rajdhani">
              {t('copyright')}
              <br />
              <span className="text-xs mt-2 block">M Global Yazılım Teknoloji Sanayi ve Ticaret Limited Şirketi</span>
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-end">
              <Link href="/privacy" className="text-text-quiet hover:text-ice transition-colors text-xs">
                {t('legal.privacy')}
              </Link>
              <Link href="/terms" className="text-text-quiet hover:text-ice transition-colors text-xs">
                {t('legal.terms')}
              </Link>
              <Link href="/cookies" className="text-text-quiet hover:text-ice transition-colors text-xs">
                {t('legal.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

