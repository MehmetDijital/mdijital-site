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
    title: `${t.pages.projects.title} | ${baseMetadata.title}`,
    description: t.pages.projects.description,
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const categories = t.pages.projects.categories as string[];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-orbitron text-center">
          {t.pages.projects.title}
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-4 font-rajdhani text-center">
          {t.pages.projects.description}
        </p>
        
        <div className="space-y-8">
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <p className="text-text-secondary text-lg md:text-xl font-rajdhani mb-6">
              {t.pages.projects.intro}
            </p>
            <p className="text-text-secondary text-base md:text-lg font-rajdhani">
              {t.pages.projects.content}
            </p>
          </div>
          
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 font-orbitron">
              Proje Kategorileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-graphite/50 border border-lead/30">
                  <span className="text-ice">•</span>
                  <span className="text-text-secondary font-rajdhani text-base md:text-lg">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
