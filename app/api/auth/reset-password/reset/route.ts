import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';
import { handleCors, getCorsHeaders } from '@/lib/cors';

const resetPasswordSchema = z.object({
  token: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    const sanitizedToken = sanitizeText(validated.token.trim()).slice(0, 255);
    const sanitizedPassword = validated.password;

    // Validate password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(sanitizedPassword)) {
      return NextResponse.json(
        {
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: sanitizedToken },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Delete all reset tokens for this user
      prisma.passwordReset.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    const origin = request.headers.get('origin');
    return NextResponse.json(
      {
        message: 'Password reset successfully',
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

    logApiError('/api/auth/reset-password/reset', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

