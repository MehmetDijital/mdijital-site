import { notFound } from 'next/navigation';
import { generateMetadata as generatePageMetadata } from '../../../metadata';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { CareersApplyForm } from '@/components/careers/CareersApplyForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; jobId: string }>;
}): Promise<Metadata> {
  const { locale, jobId } = await params;
  const baseMetadata = await generatePageMetadata({ params: Promise.resolve({ locale }) });
  const t = await import(`@/messages/${locale}.json`).then((m) => m.default);
  const job = await prisma.jobPosting.findFirst({
    where: { id: jobId, published: true },
  });
  if (!job) return baseMetadata;
  const title = locale === 'en' ? job.titleEN : job.titleTR;
  return {
    ...baseMetadata,
    title: `${t.pages.careers.applyTitle.replace('{{title}}', title)} | ${baseMetadata.title}`,
    description: t.pages.careers.applySubtitle,
  };
}

export default async function CareersApplyPage({
  params,
}: {
  params: Promise<{ locale: string; jobId: string }>;
}) {
  const { locale, jobId } = await params;
  const job = await prisma.jobPosting.findFirst({
    where: { id: jobId, published: true },
  });
  if (!job) notFound();
  const jobTitle = locale === 'en' ? job.titleEN : job.titleTR;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <CareersApplyForm jobId={job.id} jobTitle={jobTitle} />
      </div>
    </div>
  );
}
