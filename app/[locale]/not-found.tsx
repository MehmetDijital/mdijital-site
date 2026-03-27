import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from './metadata';
import { FileQuestion } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = params ? await params : { locale: 'tr' };
  const { locale } = resolvedParams;
  const paramsPromise = params || Promise.resolve({ locale: 'tr' });
  const baseMetadata = await generatePageMetadata({ params: paramsPromise });
  const t = await getTranslations({ locale, namespace: 'errors.404' });
  
  return {
    ...baseMetadata,
    title: `${t('title')} | ${baseMetadata.title}`,
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function NotFound({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const resolvedParams = params ? await params : { locale: 'tr' };
  const { locale } = resolvedParams;
  const t = await getTranslations({ locale, namespace: 'errors.404' });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-ice/10 border border-ice/20">
            <FileQuestion className="text-ice" size={64} />
          </div>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold mb-4 text-ice font-orbitron">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary font-orbitron">
          {t('title')}
        </h2>
        <p className="text-lg md:text-xl text-text-secondary mb-8 font-rajdhani max-w-md mx-auto">
          {t('message')}
        </p>
        <Link
          href="/"
          className="inline-block px-6 md:px-8 py-3 md:py-4 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded-lg font-orbitron text-sm md:text-base"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}

