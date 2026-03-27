import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/ses';
import { z } from 'zod';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security';
import { logApiError } from '@/lib/logger';

const requestResetSchema = z.object({
  email: z.string().email().max(255),
  locale: z.string().optional().default('tr'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = requestResetSchema.parse(body);

    // Sanitize email
    const sanitizedEmail = validated.email.trim().toLowerCase();

    // Rate limiting: max 3 requests per hour per email
    const rateLimitKey = `reset-password:${sanitizedEmail}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { message: 'If the email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Delete old reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token (valid for 1 hour)
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send email
    try {
      const userLocale = user.preferredLocale || validated.locale || 'tr';
      const { subject, htmlBody, textBody } = getPasswordResetEmailTemplate(
        token,
        userLocale
      );
      await sendEmail({
        to: sanitizedEmail,
        subject,
        body: textBody,
        htmlBody,
      });
    } catch (emailError) {
      logApiError('/api/auth/reset-password/request', emailError, { step: 'send_email', email: sanitizedEmail });
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Password reset link sent successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/auth/reset-password/request', error);
    return NextResponse.json(
      { error: 'Failed to send password reset link' },
      { status: 500 }
    );
  }
}

