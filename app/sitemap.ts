import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mdijital.io';

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/auth/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/auth/register', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  // Add static routes for each locale
  routing.locales.forEach((locale) => {
    staticRoutes.forEach((route) => {
      const url = locale === routing.defaultLocale && route.path === '' 
        ? baseUrl 
        : `${baseUrl}${locale === routing.defaultLocale ? '' : `/${locale}`}${route.path}`;
      
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    });
  });

  // Add blog posts (only if DATABASE_URL is available and not during build)
  // Skip database queries during build to avoid connection errors
  if (process.env.DATABASE_URL && process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      const blogPosts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      });

      routing.locales.forEach((locale) => {
        blogPosts.forEach((post) => {
          const url = `${baseUrl}${locale === routing.defaultLocale ? '' : `/${locale}`}/blog/${post.slug}`;
          sitemapEntries.push({
            url,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      });
    } catch (error) {
      // Silently skip blog posts if database is not available (e.g., during build)
      // Blog posts will be added when sitemap is generated at runtime
    }
  }

  return sitemapEntries;
}

