import { requireAuth } from '@/lib/auth';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SessionProviderWrapper } from '@/components/providers/SessionProviderWrapper';
import { DashboardTitle } from '@/components/dashboard/DashboardTitle';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const messages = await getMessages();
  
  if (session.user?.role === 'ADMIN') {
    const { redirect } = await import('next/navigation');
    redirect('/admin');
  }

  return (
    <SessionProviderWrapper session={session}>
      <NextIntlClientProvider messages={messages}>
        <div className="min-h-screen relative z-10 pointer-events-auto">
          <DashboardTitle />
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </div>
      </NextIntlClientProvider>
    </SessionProviderWrapper>
  );
}

