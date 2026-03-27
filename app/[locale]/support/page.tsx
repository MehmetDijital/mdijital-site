import { generateMetadata as generatePageMetadata } from '../metadata';
import { Metadata } from 'next';
import { Mail, Phone } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseMetadata = await generatePageMetadata({ params });
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  
  return {
    ...baseMetadata,
    title: `${t.pages.support.title} | ${baseMetadata.title}`,
    description: t.pages.support.description,
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-orbitron text-center">
          {t.pages.support.title}
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-4 font-rajdhani text-center">
          {t.pages.support.description}
        </p>
        
        <div className="space-y-8">
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <p className="text-text-secondary text-lg md:text-xl font-rajdhani mb-6">
              {t.pages.support.intro}
            </p>
            <p className="text-text-secondary text-base md:text-lg font-rajdhani mb-6">
              {t.pages.support.content}
            </p>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-graphite/50 border border-lead/30">
              <Mail className="text-ice" size={24} />
              <p className="text-text-secondary text-sm md:text-base font-rajdhani">
                {t.pages.support.responseTime}
              </p>
            </div>
          </div>
          
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 font-orbitron">
              {t.pages.support.contactTitle}
            </h2>
            <div className="space-y-4">
              <a href="mailto:iletisim@mdijital.io" className="flex items-center gap-3 p-4 rounded-lg bg-graphite/50 border border-lead/30 hover:border-ice/50 transition-colors group">
                <Mail className="text-ice shrink-0" size={24} />
                <div>
                  <span className="text-text-quiet font-rajdhani text-sm block">{t.pages.support.email}</span>
                  <span className="text-text-primary font-rajdhani text-base md:text-lg group-hover:text-ice transition-colors">{t.pages.support.emailValue}</span>
                </div>
              </a>
              <a href="tel:+902249098196" className="flex items-center gap-3 p-4 rounded-lg bg-graphite/50 border border-lead/30 hover:border-ice/50 transition-colors group">
                <Phone className="text-ice shrink-0" size={24} />
                <div>
                  <span className="text-text-quiet font-rajdhani text-sm block">{t.pages.support.phone}</span>
                  <span className="text-text-primary font-rajdhani text-base md:text-lg group-hover:text-ice transition-colors">{t.pages.support.phoneValue}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
