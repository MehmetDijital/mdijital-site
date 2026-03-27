import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { sanitizeEmail } from '@/lib/sanitize';
import { handleCors, getCorsHeaders } from '@/lib/cors';
import crypto from 'crypto';

const verifyEmailSchema = z.object({
  email: z.string().email().max(255),
  code: z.string().length(6).regex(/^\d+$/),
});

export async function POST(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const validated = verifyEmailSchema.parse(body);

    const sanitizedEmail = sanitizeEmail(validated.email);
    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'Invalid email address' },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }
    const sanitizedCode = validated.code.trim().replace(/[^\d]/g, '');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        emailVerifications: {
          where: {
            code: sanitizedCode,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    if (user.emailVerifications.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    const loginToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.deleteMany({
        where: { userId: user.id },
      }),
      prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: loginToken,
          expiresAt: tokenExpiresAt,
          used: false,
        },
      }),
    ]);

    const origin = request.headers.get('origin');
    return NextResponse.json(
      {
        message: 'Email verified successfully',
        loginToken,
      },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    const origin = request.headers.get('origin');
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    logApiError('/api/auth/verify-email/verify', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

