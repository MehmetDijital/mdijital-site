import { headers } from 'next/headers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import MeshBackgroundClient from '@/components/MeshBackgroundClient';
import { StructuredData } from '@/components/StructuredData';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth-helpers';
import { SessionProviderWrapper } from '@/components/providers/SessionProviderWrapper';

function isAdminRoute(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/en/admin' || pathname.startsWith('/en/admin/') ||
    pathname === '/tr/admin' || pathname.startsWith('/tr/admin/');
}

function isAuthRoute(pathname: string): boolean {
  return pathname === '/auth' || pathname.startsWith('/auth/') ||
    pathname === '/en/auth' || pathname.startsWith('/en/auth/') ||
    pathname === '/tr/auth' || pathname.startsWith('/tr/auth/');
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = headersList.get('x-admin-route') === 'true' || isAdminRoute(pathname);
  const isAuth = isAuthRoute(pathname);

  const messages = await getMessages();
  const session = await auth();

  if (isAdmin) {
    return (
      <SessionProviderWrapper session={session}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </SessionProviderWrapper>
    );
  }

  return (
    <SessionProviderWrapper session={session}>
      <NextIntlClientProvider messages={messages}>
        <StructuredData />
        {!isAuth && <MeshBackgroundClient />}
        <Header />
        <main className="relative z-10 w-full min-h-screen pointer-events-none [&>*]:pointer-events-auto">
          {children}
        </main>
        <Footer />
      </NextIntlClientProvider>
    </SessionProviderWrapper>
  );
}

