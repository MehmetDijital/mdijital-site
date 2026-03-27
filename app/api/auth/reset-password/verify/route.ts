import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';

const verifyTokenSchema = z.object({
  token: z.string().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = verifyTokenSchema.parse(body);

    // Sanitize token
    const sanitizedToken = validated.token.trim();

    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: sanitizedToken },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/auth/reset-password/verify', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}

