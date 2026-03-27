import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mdijital.io';
  
  return {
    name: 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.',
    short_name: 'M Dijital',
    description: 'Gürültü üretmeyiz. Mimari kurarız. Web geliştirme, mobil uygulamalar, sistem mimarisi ve AI/ML çözümleri.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0D10',
    theme_color: '#8FAFCB',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['business', 'technology', 'developer'],
    lang: 'tr',
    dir: 'ltr',
  };
}

