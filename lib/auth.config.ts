import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        verificationToken: { label: 'Verification Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const sanitizedEmail = (credentials.email as string).trim().toLowerCase();

        let user: any;
        if (credentials?.verificationToken) {
          user = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
            include: {
              passwordResets: {
                where: {
                  token: credentials.verificationToken as string,
                  expiresAt: { gt: new Date() },
                  used: false,
                },
                take: 1,
              },
            },
          });
        } else {
          user = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
          });
        }

        if (!user) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        if (credentials?.verificationToken && user.passwordResets && Array.isArray(user.passwordResets) && user.passwordResets.length > 0) {
          await prisma.passwordReset.update({
            where: { id: user.passwordResets[0].id },
            data: { used: true },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        if (!credentials?.password) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
