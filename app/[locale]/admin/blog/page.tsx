import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { AdminBlogList } from '@/components/blog/AdminBlogList';

export default async function AdminBlogPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <AdminBlogList />;
}

