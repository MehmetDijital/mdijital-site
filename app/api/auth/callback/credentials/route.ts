import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth-helpers';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { headers } from 'next/headers';
import { logApiError, logSecurityEvent } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
  locale: z.string().optional().default('tr'),
});

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const contentType = headersList.get('content-type') || '';
    
    let body: any;
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // Handle form-encoded data from NextAuth
      const formData = await request.formData();
      body = Object.fromEntries(formData);
      if (body.rememberMe) body.rememberMe = body.rememberMe === 'true';
    }
    
    const validated = loginSchema.parse(body);
    const { email, password, rememberMe, locale } = validated;

    // Sanitize email
    const sanitizedEmail = email?.trim().toLowerCase();

    const ipAddress = getClientIp(headersList);
    const rateLimitKey = `login:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 20, 30 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    if (!sanitizedEmail || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user details for locale preference update
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: { 
        id: true, 
        role: true, 
        preferredLocale: true,
      },
    });

    try {
      const result = await signIn('credentials', {
        email: sanitizedEmail,
        password,
        redirect: false,
      });

      if (!result) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      if (result.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          return NextResponse.json(
            { error: 'EMAIL_NOT_VERIFIED' },
            { status: 403 }
          );
        }
        if (result.error === 'CredentialsSignin') {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      if (user && locale && user.preferredLocale !== locale) {
        await prisma.user.update({
          where: { id: user.id },
          data: { preferredLocale: locale },
        });
      }

      return NextResponse.json({ success: true, url: result.url });
    } catch (signInError: any) {
      if (signInError?.message === 'EMAIL_NOT_VERIFIED') {
        return NextResponse.json(
          { error: 'EMAIL_NOT_VERIFIED' },
          { status: 403 }
        );
      }
      if (signInError?.type === 'CredentialsSignin' || signInError?.name === 'CredentialsSignin') {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      logApiError('/api/auth/callback/credentials', signInError, { step: 'signIn_error' });
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logApiError('/api/auth/callback/credentials', error);
    
    // Check if it's an email verification error
    if (error?.message === 'EMAIL_NOT_VERIFIED') {
      return NextResponse.json(
        { error: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

