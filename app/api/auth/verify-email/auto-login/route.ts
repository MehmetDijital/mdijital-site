import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { signIn } from '@/lib/auth-helpers';

const autoLoginSchema = z.object({
  email: z.string().email().max(255),
  loginToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = autoLoginSchema.parse(body);

    const sanitizedEmail = validated.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        passwordResets: {
          where: {
            token: validated.loginToken,
            expiresAt: { gt: new Date() },
            used: false,
          },
          take: 1,
        },
      },
    });

    if (!user || !user.emailVerified || user.passwordResets.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired login token' },
        { status: 400 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    try {
      const result = await signIn('credentials', {
        email: sanitizedEmail,
        verificationToken: validated.loginToken,
        redirect: false,
      });

      if (result && !result.error) {
        return NextResponse.json({
          success: true,
          redirectTo: '/dashboard',
        });
      }
    } catch (signInError) {
      logApiError('/api/auth/verify-email/auto-login', signInError);
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/auth/verify-email/auto-login', error);
    return NextResponse.json(
      { error: 'Failed to auto-login' },
      { status: 500 }
    );
  }
}
