import { getTranslations } from 'next-intl/server';
import { BlogList } from '@/components/blog/BlogList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('blog');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mdijital.io';
  const isTR = locale === 'tr';

  const title = isTR ? `${t('title')} | M Dijital` : `${t('title')} | M Dijital`;
  const description = t('description');

  return {
    title,
    description,
    keywords: isTR
      ? [
          'blog', 'yazılım blog', 'teknoloji blog', 'web geliştirme blog', 'mobil uygulama blog',
          'AI blog', 'makine öğrenmesi blog', 'sistem mimarisi blog', 'yazılım geliştirme blog',
          'Next.js blog', 'React blog', 'TypeScript blog', 'programlama blog', 'kod blog',
          'yazılım ipuçları', 'teknoloji haberleri', 'yazılım trendleri', 'dijital dönüşüm blog',
          'Türkiye yazılım blog', 'İstanbul tech blog', 'yazılım eğitimi', 'programlama rehberi',
          'full-stack blog', 'frontend blog', 'backend blog', 'DevOps blog', 'cloud blog',
          'blockchain blog', 'crypto blog', 'ethereum blog', 'smart contract blog', 'NFT blog',
          'DeFi blog', 'web3 blog', 'cryptocurrency blog', 'token blog', 'coin blog',
        ].join(', ')
      : [
          'blog', 'software blog', 'technology blog', 'web development blog', 'mobile app blog',
          'AI blog', 'machine learning blog', 'system architecture blog', 'software development blog',
          'Next.js blog', 'React blog', 'TypeScript blog', 'programming blog', 'coding blog',
          'software tips', 'tech news', 'software trends', 'digital transformation blog',
          'Turkey software blog', 'Istanbul tech blog', 'software education', 'programming guide',
          'full-stack blog', 'frontend blog', 'backend blog', 'DevOps blog', 'cloud blog',
          'blockchain blog', 'crypto blog', 'ethereum blog', 'smart contract blog', 'NFT blog',
          'DeFi blog', 'web3 blog', 'cryptocurrency blog', 'token blog', 'coin blog',
          'tech tutorials', 'coding tutorials', 'software best practices', 'development insights',
        ].join(', '),
    alternates: {
      canonical: `${baseUrl}${locale === 'tr' ? '' : `/${locale}`}/blog`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${locale === 'tr' ? '' : `/${locale}`}/blog`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/opengraph-image`],
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;

  return <BlogList locale={locale} page={parseInt(page || '1')} />;
}

