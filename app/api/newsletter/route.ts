import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { csrfProtection } from '@/lib/csrf';
import { sendEmail, getNewsletterWelcomeEmailTemplate, getNewsletterUnsubscribeEmailTemplate } from '@/lib/ses';
import { sanitizeEmail } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { logApiError } from '@/lib/logger';
import { z } from 'zod';
import { handleCors, getCorsHeaders } from '@/lib/cors';
import crypto from 'crypto';

const subscribeSchema = z.object({
  email: z.string().email().max(255),
  locale: z.string().optional().default('tr'),
});

const unsubscribeSchema = z.object({
  token: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  locale: z.string().optional().default('tr'),
});

const statusSchema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const csrfRes = await csrfProtection(request as NextRequest);
  if (csrfRes) return csrfRes;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'subscribe') {
      const validated = subscribeSchema.parse(body);
      const sanitizedEmail = sanitizeEmail(validated.email);

      if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }

      const rateLimitKey = `newsletter-subscribe:${sanitizedEmail}`;
      const rateLimit = await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000);
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }

      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      const subscription = await prisma.newsletterSubscription.upsert({
        where: { email: sanitizedEmail },
        update: {
          subscribed: true,
          unsubscribeToken,
          locale: validated.locale,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
        create: {
          email: sanitizedEmail,
          subscribed: true,
          unsubscribeToken,
          locale: validated.locale,
          subscribedAt: new Date(),
        },
      });

      try {
        const { subject, htmlBody, textBody } = getNewsletterWelcomeEmailTemplate(validated.locale);
        await sendEmail({
          to: sanitizedEmail,
          subject,
          body: textBody,
          htmlBody,
        });
      } catch (emailError) {
        logApiError('/api/newsletter', emailError, { step: 'send_welcome_email', email: sanitizedEmail });
      }

      const origin = request.headers.get('origin');
      return NextResponse.json(
        {
          success: true,
          message: 'Successfully subscribed to newsletter',
        },
        { headers: getCorsHeaders(origin) }
      );
    }

    if (action === 'unsubscribe') {
      const headersList = await headers();
      const ipAddress = getClientIp(headersList);
      const rateLimitKey = `newsletter-unsubscribe:${ipAddress}`;
      const rateLimit = await checkRateLimit(rateLimitKey, 30, 60 * 60 * 1000);
      if (!rateLimit.allowed) {
        const origin = request.headers.get('origin');
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: getCorsHeaders(origin) }
        );
      }

      let subscription;

      if (body.token) {
        const validated = unsubscribeSchema.parse(body);
        if (!validated.token) {
          return NextResponse.json(
            { error: 'Token is required' },
            { status: 400 }
          );
        }
        const sanitizedToken = validated.token.trim();

        subscription = await prisma.newsletterSubscription.findUnique({
          where: { unsubscribeToken: sanitizedToken },
        });

        if (!subscription) {
          return NextResponse.json(
            { error: 'Invalid unsubscribe token' },
            { status: 400 }
          );
        }
      } else if (body.email) {
        const sanitizedEmail = sanitizeEmail(body.email);
        if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
          return NextResponse.json(
            { error: 'Invalid email address' },
            { status: 400 }
          );
        }

        subscription = await prisma.newsletterSubscription.findUnique({
          where: { email: sanitizedEmail },
        });

        if (!subscription) {
          return NextResponse.json(
            { error: 'Subscription not found' },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Token or email is required' },
          { status: 400 }
        );
      }

      await prisma.newsletterSubscription.update({
        where: { id: subscription.id },
        data: {
          subscribed: false,
          unsubscribedAt: new Date(),
        },
      });

      try {
        const locale = body.locale || subscription.locale || 'tr';
        const { subject, htmlBody, textBody } = getNewsletterUnsubscribeEmailTemplate(locale);
        await sendEmail({
          to: subscription.email,
          subject,
          body: textBody,
          htmlBody,
        });
      } catch (emailError) {
        logApiError('/api/newsletter', emailError, { step: 'send_unsubscribe_email', email: subscription.email });
      }

      const origin = request.headers.get('origin');
      return NextResponse.json(
        {
          success: true,
          message: 'Successfully unsubscribed from newsletter',
        },
        { headers: getCorsHeaders(origin) }
      );
    }

    const origin = request.headers.get('origin');
    return NextResponse.json(
      { error: 'Invalid action' },
      {
        status: 400,
        headers: getCorsHeaders(origin),
      }
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

    logApiError('/api/newsletter', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter request' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

export async function GET(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const headersList = await headers();
    const ipAddress = getClientIp(headersList);
    const rateLimitKey = `newsletter-status:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getCorsHeaders(origin) }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const validated = statusSchema.parse({ email });
    const sanitizedEmail = sanitizeEmail(validated.email);

    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email: sanitizedEmail },
      select: {
        subscribed: true,
        subscribedAt: true,
      },
    });

    const origin = request.headers.get('origin');
    return NextResponse.json(
      {
        subscribed: subscription?.subscribed || false,
        subscribedAt: subscription?.subscribedAt || null,
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

    logApiError('/api/newsletter', error);
    return NextResponse.json(
      { error: 'Failed to check newsletter status' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}
