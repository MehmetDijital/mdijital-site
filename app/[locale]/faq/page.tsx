'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const t = useTranslations('pages.faq');
  const questionsRaw = t.raw('questions');
  const questions = (Array.isArray(questionsRaw) ? questionsRaw : []) as Array<{ q: string; a: string }>;
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpanded((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 pointer-events-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-orbitron text-center">
          {t('title')}
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-12 font-rajdhani text-center">
          {t('description')}
        </p>
        
        <div className="space-y-4">
          {questions.map((item, index) => (
            <div
              key={index}
              className="glass-panel rounded-xl overflow-hidden border border-lead/50 hover:border-ice/50 transition-all duration-300"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggle(index);
                }}
                className="w-full p-4 md:p-6 flex justify-between items-center text-left hover:bg-graphite/30 transition-colors cursor-pointer relative z-10"
                type="button"
                aria-expanded={expanded === index}
              >
                <h3 className="text-lg md:text-xl font-bold text-text-primary font-orbitron pr-4 flex-1">
                  {item.q}
                </h3>
                <ChevronDown
                  className={`text-ice transition-transform duration-300 flex-shrink-0 ${
                    expanded === index ? 'rotate-180' : ''
                  }`}
                  size={24}
                />
              </button>
              {expanded === index && (
                <div className="px-4 md:px-6 pb-4 md:pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-text-secondary leading-relaxed font-rajdhani text-base md:text-lg">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
