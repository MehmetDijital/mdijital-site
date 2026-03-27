import { generateMetadata as generatePageMetadata } from '../metadata';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { CareersJobList } from '@/components/careers/CareersJobList';

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
    title: `${t.pages.careers.title} | ${baseMetadata.title}`,
    description: t.pages.careers.description,
  };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const benefits = t.pages.careers.benefits as string[];
  const jobs = await prisma.jobPosting.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  const jobsForLocale = jobs.map((j) => ({
    id: j.id,
    title: locale === 'en' ? j.titleEN : j.titleTR,
    description: locale === 'en' ? j.descriptionEN : j.descriptionTR,
    location: j.location,
    jobType: j.jobType,
  }));

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-orbitron text-center">
          {t.pages.careers.title}
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-4 font-rajdhani text-center">
          {t.pages.careers.description}
        </p>
        
        <div className="space-y-8">
          {jobsForLocale.length > 0 && (
            <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 font-orbitron">
                {t.pages.careers.openPositions}
              </h2>
              <CareersJobList jobs={jobsForLocale} locale={locale} />
            </div>
          )}

          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <p className="text-text-secondary text-lg md:text-xl font-rajdhani mb-6">
              {t.pages.careers.intro}
            </p>
            <p className="text-text-secondary text-base md:text-lg font-rajdhani">
              {t.pages.careers.content}
            </p>
          </div>
          
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 font-orbitron">
              {t.pages.careers.benefitsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-graphite/50 border border-lead/30">
                  <span className="text-ice">•</span>
                  <span className="text-text-secondary font-rajdhani text-base md:text-lg">
                    {benefit}
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
