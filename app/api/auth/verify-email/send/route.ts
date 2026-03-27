import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/ses';
import { z } from 'zod';
import crypto from 'crypto';
import { logApiError } from '@/lib/logger';

const sendVerificationSchema = z.object({
  email: z.string().email().max(255),
  locale: z.string().optional().default('tr'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = sendVerificationSchema.parse(body);

    // Sanitize email
    const sanitizedEmail = validated.email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { message: 'If the email exists, a verification code has been sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Delete old verification codes for this user
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Create new verification code (valid for 10 minutes)
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send email
    let emailSent = false;
    try {
      const userLocale = user.preferredLocale || validated.locale || 'tr';
      const { subject, htmlBody, textBody } = getVerificationEmailTemplate(
        code,
        userLocale
      );
      await sendEmail({
        to: sanitizedEmail,
        subject,
        body: textBody,
        htmlBody,
      });
      emailSent = true;
    } catch (emailError) {
      logApiError('/api/auth/verify-email/send', emailError, { step: 'send_email', email: sanitizedEmail });
    }

    if (!emailSent) {
      const devCode = process.env.NODE_ENV === 'development' && code;
      if (devCode) {
        return NextResponse.json({
          message: 'Verification code (dev): ' + code,
          verificationCode: code,
          devMode: true,
        });
      }
      return NextResponse.json(
        { error: 'Email service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/auth/verify-email/send', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

