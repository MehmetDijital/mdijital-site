'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.generic');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pointer-events-auto relative z-50">
      <div className="max-w-2xl mx-auto text-center pointer-events-auto relative z-50">
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="text-red-500" size={64} />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-text-primary font-orbitron">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-8 font-rajdhani max-w-md mx-auto">
          {t('message')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto relative z-50">
          <button
            onClick={reset}
            className="px-6 md:px-8 py-3 md:py-4 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded-lg font-orbitron text-sm md:text-base pointer-events-auto"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="px-6 md:px-8 py-3 md:py-4 glass-panel border border-lead/50 text-text-primary font-bold uppercase tracking-widest hover:border-ice/50 transition-colors rounded-lg font-orbitron text-sm md:text-base pointer-events-auto"
          >
            {t('backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
