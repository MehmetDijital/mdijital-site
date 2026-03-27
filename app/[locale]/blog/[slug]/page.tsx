import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BlogDetail } from '@/components/blog/BlogDetail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mdijital.io';
  
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog/${slug}?locale=${locale}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return {
        title: 'Blog Post | M Dijital',
        description: 'Blog post not found',
      };
    }

    const post = await response.json();
    const title = `${post.title} | M Dijital Blog`;
    const description = post.excerpt || post.title;
    const url = `${baseUrl}${locale === 'tr' ? '' : `/${locale}`}/blog/${slug}`;

    return {
      title,
      description,
      keywords: [
        ...(post.tags || []),
        'blog', 'technology', 'software', 'web development', 'mobile app', 'AI', 'machine learning',
        'software development', 'programming', 'coding', 'tech blog', 'software blog',
        'Next.js', 'React', 'TypeScript', 'development', 'programming tips', 'tech insights',
        'blockchain', 'crypto', 'ethereum', 'smart contract', 'NFT', 'DeFi', 'web3', 'token', 'coin',
        locale === 'tr' 
          ? 'yazılım blog, teknoloji blog, programlama blog, kod blog, yazılım ipuçları, blockchain blog, kripto blog, ethereum blog'
          : 'software blog, technology blog, programming blog, coding blog, software tips, blockchain blog, crypto blog, ethereum blog',
      ].join(', '),
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || 'M Dijital'],
        images: post.featuredImage
          ? [
              {
                url: post.featuredImage,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [
              {
                url: `${baseUrl}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.featuredImage ? [post.featuredImage] : [`${baseUrl}/opengraph-image`],
      },
    };
  } catch {
    return {
      title: 'Blog Post | M Dijital',
      description: 'Blog post',
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  return <BlogDetail slug={slug} locale={locale} />;
}

