import { generateMetadata as generatePageMetadata } from '../../metadata';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Code, Smartphone, Network, Brain, Shield, Palette, Building2, TrendingUp, Sparkles, Gamepad2 } from 'lucide-react';

const services = {
  web: { icon: Code, key: 'web' },
  mobile: { icon: Smartphone, key: 'mobile' },
  architecture: { icon: Network, key: 'architecture' },
  ai: { icon: Brain, key: 'ai' },
  blockchain: { icon: Shield, key: 'blockchain' },
  digitalIdentity: { icon: Building2, key: 'digitalIdentity' },
  digitalMedia: { icon: TrendingUp, key: 'digitalMedia' },
  design: { icon: Palette, key: 'design' },
  governance: { icon: Shield, key: 'governance' },
  marketing: { icon: TrendingUp, key: 'marketing' },
  metaverse: { icon: Sparkles, key: 'metaverse' },
  gameDevelopment: { icon: Gamepad2, key: 'gameDevelopment' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}): Promise<Metadata> {
  const { locale, service } = await params;
  if (!services[service as keyof typeof services]) {
    return {};
  }
  
  const baseMetadata = await generatePageMetadata({ params: Promise.resolve({ locale }) });
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const serviceData = t.pages.services[services[service as keyof typeof services].key as keyof typeof t.pages.services] as {
    title: string;
    description: string;
  };
  
  return {
    ...baseMetadata,
    title: `${serviceData.title} | ${baseMetadata.title}`,
    description: serviceData.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { locale, service } = await params;
  
  if (!services[service as keyof typeof services]) {
    notFound();
  }
  
  const t = await import(`@/messages/${locale}.json`).then(m => m.default);
  const serviceKey = services[service as keyof typeof services].key;
  const serviceData = t.pages.services[serviceKey as keyof typeof t.pages.services] as {
    title: string;
    description: string;
    content: string;
    features?: string[];
  };
  const Icon = services[service as keyof typeof services].icon;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-lg bg-ice/10">
            <Icon className="text-ice" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary font-orbitron">
            {serviceData.title}
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-text-secondary mb-12 font-rajdhani">
          {serviceData.description}
        </p>
        
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
            <div className="prose prose-invert max-w-none">
              <p className="text-text-secondary leading-relaxed text-base md:text-lg font-rajdhani mb-6">
                {serviceData.content}
              </p>
            </div>
          </div>
          
          {serviceData.features && serviceData.features.length > 0 && (
            <div className="glass-panel p-6 md:p-8 rounded-xl border border-lead/50">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 font-orbitron">
                {locale === 'tr' ? 'Hizmet Kapsamı' : 'Service Scope'}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceData.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-ice mt-1">•</span>
                    <span className="text-text-secondary font-rajdhani text-base md:text-lg">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
