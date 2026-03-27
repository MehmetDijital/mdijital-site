'use client';

import { useLocale } from 'next-intl';

export function StructuredData() {
  const locale = useLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mdijital.io';
  const isTR = locale === 'tr';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'M Dijital',
    url: baseUrl,
    logo: `${baseUrl}/mdijital-logo-white.webp`,
    description: isTR
      ? 'Gürültü üretmeyiz. Mimari kurarız. Web geliştirme, mobil uygulamalar, sistem mimarisi ve AI/ML çözümleri.'
      : 'We don\'t create noise. We build architecture. Web development, mobile applications, system architecture and AI/ML solutions.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'Istanbul',
      addressRegion: 'Istanbul',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'iletisim@mdijital.io',
      telephone: '+90-224-9098196',
    },
    sameAs: [
      // Add social media links when available
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'M Dijital',
    url: baseUrl,
    description: isTR
      ? 'Akıllı Sistemler. İnsan Merkezli Gelecek.'
      : 'Smart Systems. Human-Centered Future.',
    inLanguage: [locale === 'tr' ? 'tr-TR' : 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

