import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { AdminBlogEditor } from '@/components/blog/AdminBlogEditor';

export default async function NewBlogPostPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return <AdminBlogEditor />;
}

