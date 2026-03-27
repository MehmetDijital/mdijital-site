import type { Metadata } from 'next';
import { getSafeBaseUrl, getSafeMetadataBase } from '@/lib/safe-url';

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return Promise.resolve(params).then(({ locale }) => {
    const baseUrl = getSafeBaseUrl();
    const isTR = locale === 'tr';

    const title = isTR
      ? 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.'
      : 'M Dijital | Smart Systems. Human-Centered Future.';
    
    const description = isTR
      ? 'Gürültü üretmeyiz. Mimari kurarız. Web geliştirme, mobil uygulamalar, sistem mimarisi ve AI/ML çözümleri. Modern, ölçeklenebilir ve güvenli dijital sistemler.'
      : 'We don\'t create noise. We build architecture. Web development, mobile applications, system architecture and AI/ML solutions. Modern, scalable and secure digital systems.';

    const keywords = isTR
      ? [
          // Core Services
          'web geliştirme', 'mobil uygulama geliştirme', 'sistem mimarisi', 'yazılım geliştirme', 
          'dijital dönüşüm', 'yazılım çözümleri', 'custom software development', 'enterprise software',
          // Technologies & Frameworks
          'Next.js', 'React', 'TypeScript', 'Node.js', 'JavaScript', 'Python', 'Django', 'Flask',
          'Vue.js', 'Angular', 'Express.js', 'NestJS', 'GraphQL', 'REST API', 'Microservices',
          'Docker', 'Kubernetes', 'AWS', 'Cloud Computing', 'Serverless', 'CI/CD',
          // AI & ML
          'AI', 'yapay zeka', 'makine öğrenmesi', 'machine learning', 'deep learning', 'neural networks',
          'NLP', 'doğal dil işleme', 'computer vision', 'ChatGPT', 'LLM', 'AI integration',
          'AI consulting', 'AI development', 'generative AI', 'AI automation',
          // Mobile Development
          'iOS development', 'Android development', 'React Native', 'Flutter', 'mobile app design',
          'cross-platform', 'native app', 'hybrid app', 'app store optimization',
          // Regional (Turkey)
          'Türkiye', 'İstanbul', 'Ankara', 'İzmir', 'Türkiye yazılım şirketi', 'İstanbul yazılım firması',
          'Türk yazılım geliştirici', 'Türkiye teknoloji şirketi', 'İstanbul IT firması',
          'Türkiye web tasarım', 'İstanbul mobil uygulama', 'Türkiye dijital ajans',
          // Regional (Europe/International)
          'Europe software company', 'Finland software development', 'Helsinki tech company',
          'Nordic software solutions', 'EU software development', 'international software services',
          // Industry Terms
          'yazılım şirketi', 'yazılım firması', 'IT şirketi', 'teknoloji şirketi', 'dijital ajans',
          'software company', 'tech company', 'IT company', 'digital agency', 'development agency',
          // Trending 2025
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
          // Business Terms
          'startup development', 'MVP development', 'product development', 'software consulting',
          'technical consulting', 'code review', 'software maintenance', 'legacy modernization',
          'performance optimization', 'scalability', 'security', 'cybersecurity',
        ].join(', ')
      : [
          // Core Services
          'web development', 'mobile application development', 'system architecture', 'software development',
          'digital transformation', 'software solutions', 'custom software development', 'enterprise software',
          // Technologies & Frameworks
          'Next.js', 'React', 'TypeScript', 'Node.js', 'JavaScript', 'Python', 'Django', 'Flask',
          'Vue.js', 'Angular', 'Express.js', 'NestJS', 'GraphQL', 'REST API', 'Microservices',
          'Docker', 'Kubernetes', 'AWS', 'Cloud Computing', 'Serverless', 'CI/CD',
          // AI & ML
          'AI', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks',
          'NLP', 'natural language processing', 'computer vision', 'ChatGPT', 'LLM', 'AI integration',
          'AI consulting', 'AI development', 'generative AI', 'AI automation',
          // Mobile Development
          'iOS development', 'Android development', 'React Native', 'Flutter', 'mobile app design',
          'cross-platform', 'native app', 'hybrid app', 'app store optimization',
          // Regional (Turkey)
          'Turkey', 'Istanbul', 'Ankara', 'Izmir', 'Turkey software company', 'Istanbul software firm',
          'Turkish software developer', 'Turkey technology company', 'Istanbul IT company',
          'Turkey web design', 'Istanbul mobile app', 'Turkey digital agency',
          // Regional (Europe/International)
          'Europe software company', 'Finland software development', 'Helsinki tech company',
          'Nordic software solutions', 'EU software development', 'international software services',
          'Scandinavian tech', 'Baltic software', 'European development',
          // Industry Terms
          'software company', 'tech company', 'IT company', 'digital agency', 'development agency',
          'software consultancy', 'technology consultancy', 'IT consultancy',
          // Trending 2025
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
          // Business Terms
          'startup development', 'MVP development', 'product development', 'software consulting',
          'technical consulting', 'code review', 'software maintenance', 'legacy modernization',
          'performance optimization', 'scalability', 'security', 'cybersecurity',
        ].join(', ');

    return {
      title,
      description,
      keywords,
      authors: [{ name: 'M Dijital' }],
      creator: 'M Dijital',
      publisher: 'M Dijital',
      metadataBase: getSafeMetadataBase(),
      alternates: {
        canonical: `${baseUrl}${locale === 'tr' ? '' : `/${locale}`}`,
        languages: {
          'tr': `${baseUrl}/tr`,
          'en': `${baseUrl}/en`,
          'x-default': baseUrl,
        },
      },
      openGraph: {
        title,
        description,
        url: `${baseUrl}${locale === 'tr' ? '' : `/${locale}`}`,
        siteName: 'M Dijital',
        locale: locale === 'tr' ? 'tr_TR' : 'en_US',
        type: 'website',
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.',
        },
      ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${baseUrl}/opengraph-image`],
        creator: '@mdijital',
      },
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
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      },
    };
  });
}

