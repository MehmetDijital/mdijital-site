import { headers } from 'next/headers';
import { auth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

function getAdminLoginPath(headersList: Headers): string {
  const xForwardedHost = headersList.get('x-forwarded-host');
  const hostHeader = headersList.get('host') || '';
  const host = (xForwardedHost ?? hostHeader).split(',')[0].trim();
  return host.startsWith('admin.mdijital.io') ? '/' : '/admin';
}

export async function requireAdmin() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const adminLoginPath = getAdminLoginPath(headersList);
  const isAdminRoute = pathname === '/' || pathname.startsWith('/admin');

  try {
    const session = await auth();
    if (!session) {
      redirect(isAdminRoute ? adminLoginPath : '/auth/login');
    }
    if (session.user?.role !== 'ADMIN') {
      redirect(isAdminRoute ? adminLoginPath : '/auth/login');
    }
    return session;
  } catch (err: unknown) {
    const d = (err as { digest?: string })?.digest;
    if (typeof d === 'string' && d.startsWith('NEXT_REDIRECT')) throw err;
    redirect(isAdminRoute ? adminLoginPath : '/auth/login');
  }
}

export async function requireCustomer() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  if (session.user?.role === 'ADMIN') redirect('/admin');
  if (session.user?.role !== 'CUSTOMER') redirect('/auth/login');
  return session;
}

