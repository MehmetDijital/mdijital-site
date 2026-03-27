'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { X } from 'lucide-react';

type CharacterItem = {
  id: string;
  title: string;
  subtitle: string;
  slogan: string;
  identity: string;
  principle: string;
};

export function Alanlar() {
  const t = useTranslations('alanlar');
  const allItems = t.raw('items') as CharacterItem[];
  const items = allItems.filter((item) => item.id !== 'cyborg');
  const [selectedItem, setSelectedItem] = useState<CharacterItem | null>(null);

  return (
    <>
      <section id="alanlar" className="w-full max-w-6xl mb-40 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-text-primary">
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => setSelectedItem(item)}
              className="group text-left relative overflow-hidden glass-panel p-6 rounded-2xl border border-lead/50 hover:border-purple/50 transition-all duration-300 micro-interaction"
            >
              <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-ice transition-colors font-orbitron">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm mb-2 font-rajdhani">{item.subtitle}</p>
              <p className="text-ice text-xs italic mt-3 font-rajdhani">{item.slogan}</p>
            </button>
          ))}
        </div>
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-obsidian/90"
          style={{
            opacity: selectedItem ? 1 : 0,
            pointerEvents: selectedItem ? 'all' : 'none',
            transition: 'opacity 0.4s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div className="glass-panel w-full max-w-2xl rounded-xl relative shadow-[0_0_50px_rgba(143,175,203,0.1)] border border-lead/50">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-graphite/50 hover:bg-graphite flex items-center justify-center transition-colors text-text-primary hover:text-ice"
            >
              <X size={20} />
            </button>
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold mb-2 text-text-primary font-orbitron">{selectedItem.title}</h2>
              <p className="text-text-secondary mb-4 font-rajdhani">{selectedItem.subtitle}</p>
              <p className="text-ice text-lg italic mb-6 font-rajdhani">{selectedItem.slogan}</p>
              <div className="space-y-4 mt-8">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-text-quiet mb-2">
                    {t('identityLabel')}
                  </h3>
                  <p className="text-text-secondary leading-relaxed font-rajdhani">{selectedItem.identity}</p>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-text-quiet mb-2 font-orbitron">
                    {t('principleLabel')}
                  </h3>
                  <p className="text-text-primary leading-relaxed font-rajdhani">{selectedItem.principle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

