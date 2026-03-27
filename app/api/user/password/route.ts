import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sendEmail, getPasswordChangeEmailTemplate } from '@/lib/ses';
import { logApiError } from '@/lib/logger';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { handleCors, getCorsHeaders } from '@/lib/cors';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function PUT(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const session = await auth();
    if (!session?.user) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }
    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(validated.newPassword)) {
      return NextResponse.json(
        {
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user?.id || '' },
      select: {
        id: true,
        email: true,
        password: true,
        preferredLocale: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      validated.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(validated.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    try {
      const locale = user.preferredLocale || 'tr';
      const { subject, htmlBody, textBody } = getPasswordChangeEmailTemplate(locale);
      await sendEmail({
        to: user.email,
        subject,
        body: textBody,
        htmlBody,
      });
    } catch (emailError) {
      logApiError('/api/user/password', emailError, { step: 'send_password_change_email', email: user.email });
    }

    const origin = request.headers.get('origin');
    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
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
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: getCorsHeaders(origin) }
      );
    }
    logApiError('/api/user/password', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}
