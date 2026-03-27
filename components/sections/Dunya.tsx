'use client';

import { useTranslations } from 'next-intl';

type Card = {
  id: string;
  statement: string;
  response: string;
};

export function Dunya() {
  const t = useTranslations('dunya');
  const cards = t.raw('cards') as Card[];

  return (
    <section id="gok" className="w-full max-w-6xl mb-40 py-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 font-orbitron">
          {t('title')}
        </h2>
        <p className="text-text-secondary text-lg md:text-xl font-rajdhani">
          {t('subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50 hover:border-ice/50 transition-all duration-300 group"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="space-y-4">
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-rajdhani">
                {card.statement}
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-ice/30 to-transparent"></div>
              <p className="text-xl md:text-2xl text-ice leading-relaxed font-orbitron font-bold">
                {card.response}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

