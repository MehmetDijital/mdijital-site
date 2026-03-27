import { useTranslations } from 'next-intl';
import { generateMetadata as generatePageMetadata } from '../metadata';
import { Metadata } from 'next';

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
    title: `${t.pages.about.title} | ${baseMetadata.title}`,
    description: t.pages.about.description,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const content = t.pages.about.content;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-orbitron">
          {t.pages.about.title}
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-12 font-rajdhani">
          {t.pages.about.description}
        </p>
        
        <div className="space-y-8">
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 font-orbitron">
              {content.heading}
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed font-rajdhani">
              <p className="text-base md:text-lg">{content.paragraph1}</p>
              <p className="text-base md:text-lg">{content.paragraph2}</p>
              <p className="text-base md:text-lg">{content.paragraph3}</p>
            </div>
          </div>
          
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 font-orbitron">
              {content.vision.title}
            </h2>
            <p className="text-text-secondary leading-relaxed text-base md:text-lg font-rajdhani">
              {content.vision.content}
            </p>
          </div>
          
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 font-orbitron">
              {content.mission.title}
            </h2>
            <p className="text-text-secondary leading-relaxed text-base md:text-lg font-rajdhani">
              {content.mission.content}
            </p>
          </div>
          
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 font-orbitron">
              {content.approach.title}
            </h2>
            <p className="text-text-secondary leading-relaxed text-base md:text-lg font-rajdhani">
              {content.approach.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
