import { useTranslations } from 'next-intl';
import { generateMetadata as generatePageMetadata } from '../metadata';
import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { Code, Smartphone, Network, Brain, Shield, Palette, Building2, TrendingUp, Sparkles, Globe, Gamepad2 } from 'lucide-react';

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
    title: `${t.pages.services.title} | ${baseMetadata.title}`,
    description: t.pages.services.description,
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const services = [
    { id: 'web', icon: Code, path: '/services/web' },
    { id: 'mobile', icon: Smartphone, path: '/services/mobile' },
    { id: 'architecture', icon: Network, path: '/services/architecture' },
    { id: 'ai', icon: Brain, path: '/services/ai' },
    { id: 'blockchain', icon: Shield, path: '/services/blockchain' },
    { id: 'digitalIdentity', icon: Building2, path: '/services/digitalIdentity' },
    { id: 'digitalMedia', icon: TrendingUp, path: '/services/digitalMedia' },
    { id: 'design', icon: Palette, path: '/services/design' },
    { id: 'governance', icon: Shield, path: '/services/governance' },
    { id: 'marketing', icon: TrendingUp, path: '/services/marketing' },
    { id: 'metaverse', icon: Sparkles, path: '/services/metaverse' },
    { id: 'gameDevelopment', icon: Gamepad2, path: '/services/gameDevelopment' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-orbitron text-center">
          {t.pages.services.title}
        </h1>
        <p className="text-xl md:text-2xl text-text-secondary mb-12 font-rajdhani text-center max-w-3xl mx-auto">
          {t.pages.services.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            const serviceData = t.pages.services[service.id as keyof typeof t.pages.services] as {
              title: string;
              description: string;
            };
            
            return (
              <Link
                key={service.id}
                href={service.path}
                className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50 hover:border-ice/50 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-ice/10 group-hover:bg-ice/20 transition-colors">
                    <Icon className="text-ice" size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-text-primary mb-2 font-orbitron">
                      {serviceData.title}
                    </h2>
                    <p className="text-text-secondary font-rajdhani">
                      {serviceData.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
