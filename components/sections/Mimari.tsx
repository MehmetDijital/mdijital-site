'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Mimari() {
  const t = useTranslations('mimari');
  const items = t.raw('items') as Array<{ title: string; description: string }>;
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section id="mimari" className="w-full max-w-4xl mb-40 py-20">
      <h2 className="text-4xl font-bold mb-12 text-center text-text-primary">
        {t('title')}
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="glass-panel rounded-xl overflow-hidden border border-lead/50 hover:border-purple/50 transition-all duration-300 micro-interaction"
          >
            <button
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="w-full p-6 flex justify-between items-center text-left"
            >
              <h3 className="text-xl font-bold text-text-primary font-orbitron">{item.title}</h3>
              <ChevronDown
                className={`text-ice transition-transform ${
                  expanded === index ? 'rotate-180' : ''
                }`}
                size={24}
              />
            </button>
            {expanded === index && (
              <div className="px-6 pb-6">
                <p className="text-text-secondary leading-relaxed font-rajdhani">{item.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

