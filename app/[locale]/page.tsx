import { Hero } from '@/components/sections/Hero';
import { Dunya } from '@/components/sections/Dunya';
import { Mimari } from '@/components/sections/Mimari';
import { Alanlar } from '@/components/sections/Alanlar';
import { Temas } from '@/components/sections/Temas';
import { generateMetadata as generatePageMetadata } from './metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return generatePageMetadata({ params });
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 pt-32 pb-20 flex flex-col items-center pointer-events-auto">
      <Hero />
      <Dunya />
      <Mimari />
      <Alanlar />
      <Temas />
    </div>
  );
}

