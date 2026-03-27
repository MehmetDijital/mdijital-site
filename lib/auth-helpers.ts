import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const nextAuth = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

export const { signIn, signOut, auth } = nextAuth;
