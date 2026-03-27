'use client';

import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('home');

  return (
    <section className="h-screen flex flex-col justify-center items-center text-center mb-24 w-full">
      <h1 className="text-5xl md:text-8xl font-black mb-6 text-text-primary leading-tight font-orbitron whitespace-pre-line">
        {t('mainStatement')}
      </h1>
      <p className="text-text-secondary tracking-[0.3em] text-sm md:text-base mt-6 font-medium uppercase font-rajdhani">
        {t('subtitle')}
      </p>
    </section>
  );
}

