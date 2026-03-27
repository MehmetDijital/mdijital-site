import { auth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  return session;
}

