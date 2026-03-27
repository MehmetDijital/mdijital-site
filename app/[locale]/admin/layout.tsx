import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { AdminNav } from '@/components/admin/AdminNav';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const host = headersList.get('host') || '';
  const session = await auth();

  const isAdminRoot = pathname === '/' || pathname === '/admin' || pathname === '/en/admin' || pathname === '/tr/admin';
  const adminLoginPath = host.startsWith('admin.mdijital.io') ? '/panel' : '/admin';

  if (!session || session.user?.role !== 'ADMIN') {
    if (isAdminRoot) {
      return <AdminLoginForm redirectTo={adminLoginPath} />;
    }
    redirect(adminLoginPath);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 container mx-auto px-4 py-4 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

