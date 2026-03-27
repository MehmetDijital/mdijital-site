import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getSafeMetadataBase } from '@/lib/safe-url';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title: {
    default: 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.',
    template: '%s | M Dijital',
  },
  description: 'Gürültü üretmeyiz. Mimari kurarız. Web geliştirme, mobil uygulamalar, sistem mimarisi ve AI/ML çözümleri.',
  keywords: [
    // Core Services (TR)
    'web geliştirme', 'mobil uygulama geliştirme', 'sistem mimarisi', 'yazılım geliştirme',
    'dijital dönüşüm', 'yazılım çözümleri', 'custom software development', 'enterprise software',
    // Technologies (TR/EN)
    'Next.js', 'React', 'TypeScript', 'Node.js', 'JavaScript', 'Python', 'Django', 'Flask',
    'Vue.js', 'Angular', 'Express.js', 'NestJS', 'GraphQL', 'REST API', 'Microservices',
    'Docker', 'Kubernetes', 'AWS', 'Cloud Computing', 'Serverless', 'CI/CD',
    // AI & ML (TR/EN)
    'AI', 'yapay zeka', 'makine öğrenmesi', 'machine learning', 'deep learning', 'neural networks',
    'NLP', 'doğal dil işleme', 'computer vision', 'ChatGPT', 'LLM', 'AI integration',
    'AI consulting', 'AI development', 'generative AI', 'AI automation',
    // Mobile (TR/EN)
    'iOS development', 'Android development', 'React Native', 'Flutter', 'mobile app design',
    'cross-platform', 'native app', 'hybrid app', 'app store optimization',
    // Regional - Turkey
    'Türkiye', 'İstanbul', 'Ankara', 'İzmir', 'Türkiye yazılım şirketi', 'İstanbul yazılım firması',
    'Türk yazılım geliştirici', 'Türkiye teknoloji şirketi', 'İstanbul IT firması',
    'Türkiye web tasarım', 'İstanbul mobil uygulama', 'Türkiye dijital ajans',
    // Regional - International
    'Turkey', 'Istanbul', 'Ankara', 'Izmir', 'Turkey software company', 'Istanbul software firm',
    'Turkish software developer', 'Turkey technology company', 'Istanbul IT company',
    'Europe software company', 'Finland software development', 'Helsinki tech company',
    'Nordic software solutions', 'EU software development', 'international software services',
    'Scandinavian tech', 'Baltic software', 'European development',
    // Industry Terms (TR/EN)
    'yazılım şirketi', 'yazılım firması', 'IT şirketi', 'teknoloji şirketi', 'dijital ajans',
    'software company', 'tech company', 'IT company', 'digital agency', 'development agency',
    'software consultancy', 'technology consultancy', 'IT consultancy',
    // Trending 2025 (TR/EN)
    'full-stack development', 'frontend development', 'backend development', 'DevOps',
    'cloud migration', 'digital transformation consulting', 'agile development', 'scrum',
    'API development', 'database design', 'PostgreSQL', 'MongoDB', 'Redis',
    'e-commerce development', 'SaaS development', 'platform development',
    // Blockchain & Web3
    'web3', 'blockchain', 'blockchain development', 'smart contract', 'smart contracts',
    'ethereum', 'Ethereum', 'ETH', 'cryptocurrency', 'crypto', 'coin', 'token', 'token development',
    'NFT', 'NFT development', 'DeFi', 'decentralized finance', 'dApp', 'dApps', 'decentralized applications',
    'solidity', 'Solidity', 'Web3.js', 'Ethers.js', 'MetaMask', 'wallet integration', 'blockchain consulting',
    'crypto wallet', 'tokenomics', 'ICO', 'IDO', 'STO', 'blockchain architecture', 'blockchain solutions',
    'Bitcoin', 'BTC', 'crypto exchange', 'crypto trading', 'blockchain platform', 'smart contract audit',
    'blockchain integration', 'crypto payment', 'cryptocurrency development', 'token launch', 'coin launch',
    'IoT solutions', 'edge computing',
    'progressive web apps', 'PWAs', 'server-side rendering', 'SSR', 'static site generation', 'SSG',
    // Business Terms (TR/EN)
    'startup development', 'MVP development', 'product development', 'software consulting',
    'technical consulting', 'code review', 'software maintenance', 'legacy modernization',
    'performance optimization', 'scalability', 'security', 'cybersecurity',
  ],
  authors: [{ name: 'M Dijital' }],
  creator: 'M Dijital',
  publisher: 'M Dijital',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    siteName: 'M Dijital',
    title: 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.',
    description: 'Gürültü üretmeyiz. Mimari kurarız. Web geliştirme, mobil uygulamalar, sistem mimarisi ve AI/ML çözümleri.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.',
    description: 'Gürültü üretmeyiz. Mimari kurarız.',
    images: ['/opengraph-image'],
    creator: '@mdijital',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

