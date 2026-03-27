import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getContactConfirmationEmailTemplate } from '@/lib/ses';
import { logApiError } from '@/lib/logger';
import { sanitizeName, sanitizeProjectIdea, sanitizeText } from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { csrfProtection } from '@/lib/csrf';
import { headers } from 'next/headers';
import { z } from 'zod';
import { handleCors, getCorsHeaders } from '@/lib/cors';

const contactSchema = z.object({
  name: z.string().max(100).optional().nullable().transform((v) => (v == null || String(v).trim() === '' ? undefined : String(v).trim())),
  email: z.string().max(255).optional().nullable().transform((v) => (v == null || String(v).trim() === '' ? undefined : String(v).trim().toLowerCase())).refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: 'Invalid email' }),
  projectIdea: z.string().min(10, 'Project idea must be at least 10 characters').max(5000),
  timeHorizon: z.string().max(200),
  thresholdQuestion: z.string().min(10, 'Threshold question must be at least 10 characters').max(5000),
  locale: z.string().optional().default('tr'),
});

export async function POST(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const csrfRes = await csrfProtection(request as NextRequest);
  if (csrfRes) return csrfRes;

  try {
    const headersList = await headers();
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const ipAddress = getClientIp(headersList);
    const rateLimitKey = `contact:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getCorsHeaders(origin),
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = validated.name ? sanitizeName(validated.name) : null;
    const sanitizedProjectIdea = sanitizeProjectIdea(validated.projectIdea);
    const sanitizedTimeHorizon = sanitizeText(validated.timeHorizon);
    const sanitizedThresholdQuestion = sanitizeProjectIdea(validated.thresholdQuestion);

    if (!sanitizedProjectIdea || sanitizedProjectIdea.length < 10) {
      return NextResponse.json(
        { error: 'Project idea must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!sanitizedThresholdQuestion || sanitizedThresholdQuestion.length < 10) {
      return NextResponse.json(
        { error: 'Threshold question must be at least 10 characters' },
        { status: 400 }
      );
    }

    const locale = validated.locale || 'tr';
    const userEmail = validated.email ?? undefined;

    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name: sanitizedName,
        email: userEmail,
        projectIdea: sanitizedProjectIdea,
        timeHorizon: sanitizedTimeHorizon,
        thresholdQuestion: sanitizedThresholdQuestion,
        locale,
        ipAddress: ipAddress.split(',')[0].trim(),
        status: 'New',
      },
    });

    if (userEmail) {
      try {
        const { subject, htmlBody, textBody } = getContactConfirmationEmailTemplate(locale);
        await sendEmail({
          to: userEmail,
          subject,
          body: textBody,
          htmlBody,
        });
      } catch (emailError) {
        logApiError('/api/contact', emailError, { step: 'send_confirmation_email', email: userEmail });
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.AWS_SES_FROM_EMAIL;

    if (adminEmail) {
      try {
        const emailBody = `Name: ${sanitizedName || 'Not provided'}\nEmail: ${userEmail || 'Not provided'}\nProject Idea: ${sanitizedProjectIdea}\nTime Horizon: ${sanitizedTimeHorizon}\nThreshold Question: ${sanitizedThresholdQuestion}`;
        await sendEmail({
          to: adminEmail,
          subject: `New Contact Form Submission${sanitizedName ? ` from ${sanitizedName}` : ''}`,
          body: emailBody,
          htmlBody: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName || 'Not provided'}</p>
          <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
          <p><strong>Project Idea:</strong></p>
          <p>${sanitizedProjectIdea.replace(/\n/g, '<br>')}</p>
          <p><strong>Time Horizon:</strong> ${sanitizedTimeHorizon}</p>
          <p><strong>Threshold Question:</strong></p>
          <p>${sanitizedThresholdQuestion.replace(/\n/g, '<br>')}</p>
        `,
        });
      } catch (adminEmailError) {
        logApiError('/api/contact', adminEmailError, { step: 'send_admin_notification', to: adminEmail });
      }
    }

    return NextResponse.json({ success: true, id: contactSubmission.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstMessage = error.errors[0]?.message ?? 'Invalid input';
      return NextResponse.json(
        { error: typeof firstMessage === 'string' ? firstMessage : 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/contact', error);
    const origin = request.headers.get('origin');
    return NextResponse.json(
      { error: 'Failed to submit form' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

