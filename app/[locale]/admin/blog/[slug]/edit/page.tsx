import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-helpers';
import { AdminBlogEditor } from '@/components/blog/AdminBlogEditor';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { slug } = await params;

  return <AdminBlogEditor slug={slug} />;
}

