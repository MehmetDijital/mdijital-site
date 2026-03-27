import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/ses';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security';
import { headers } from 'next/headers';
import { logApiError, logSecurityEvent } from '@/lib/logger';
import { sanitizeEmail, sanitizeName } from '@/lib/sanitize';

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().max(100).optional(),
  locale: z.string().optional().default('tr'),
});

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Rate limiting: max 3 registrations per hour per IP
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const rateLimitKey = `register:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      logSecurityEvent('rate_limit_exceeded', { endpoint: '/api/auth/register', ipAddress });
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(validated.email);
    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    const sanitizedName = validated.name ? sanitizeName(validated.name) : null;

    // Validate password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(validated.password)) {
      return NextResponse.json(
        {
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password with higher cost factor for security
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create user (emailVerified defaults to false)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: sanitizedName,
        role: 'CUSTOMER',
        emailVerified: false,
        preferredLocale: validated.locale || 'tr',
      },
    });

    // Generate 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();

    // Create verification code (valid for 10 minutes)
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send verification email
    let emailSent = false;
    try {
      const { subject, htmlBody, textBody } = getVerificationEmailTemplate(
        code,
        validated.locale
      );
      await sendEmail({
        to: sanitizedEmail,
        subject,
        body: textBody,
        htmlBody,
      });
      emailSent = true;
    } catch (emailError) {
      logApiError('/api/auth/register', emailError, { step: 'send_verification_email', email: sanitizedEmail });
      // Continue even if email fails - user can request resend
    }

    const response: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: false,
      emailSent,
      message: emailSent
        ? 'Registration successful. Please verify your email.'
        : 'Registration successful. Verification email could not be sent; please use Resend code on the next page.',
    };

    if (!emailSent && process.env.NODE_ENV === 'development') {
      response.verificationCode = code;
      response.devMode = true;
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/auth/register', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}

