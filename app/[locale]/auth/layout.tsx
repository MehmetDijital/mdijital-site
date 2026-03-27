import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import MeshBackgroundClient from '@/components/MeshBackgroundClient';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role === 'ADMIN') redirect('/admin');
  if (session?.user) redirect('/dashboard');
  return (
    <>
      <MeshBackgroundClient />
      {children}
    </>
  );
}
