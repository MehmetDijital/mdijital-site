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
    title: `${t.pages.terms.title} | ${baseMetadata.title}`,
    description: t.pages.terms.description,
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const sections = t.pages.terms.sections as Array<{ title: string; content: string }>;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 font-orbitron">
            {t.pages.terms.title}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-2 font-rajdhani">
            {t.pages.terms.companyName}
          </p>
          <p className="text-sm md:text-base text-text-quiet font-rajdhani">
            {t.pages.terms.lastUpdated}
          </p>
        </div>
        
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 font-orbitron">
                {section.title}
              </h2>
              <p className="text-text-secondary leading-relaxed text-base md:text-lg font-rajdhani">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
