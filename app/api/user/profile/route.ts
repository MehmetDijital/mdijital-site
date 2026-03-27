import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sendEmail, getProfileUpdateEmailTemplate } from '@/lib/ses';
import { sanitizeName, sanitizeEmail } from '@/lib/sanitize';
import { logApiError } from '@/lib/logger';
import { z } from 'zod';
import { handleCors, getCorsHeaders } from '@/lib/cors';

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  preferredLocale: z.enum(['tr', 'en']).optional(),
});

export async function GET(request: Request) {
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
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        preferredLocale: true,
        createdAt: true,
      },
    });

    if (!user) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'User not found' },
        {
          status: 404,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const origin = request.headers.get('origin');
    return NextResponse.json(user, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    const origin = request.headers.get('origin');
    logApiError('/api/user/profile', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

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
    const validated = updateProfileSchema.parse(body);

    const updateData: any = {};

    if (validated.name !== undefined) {
      const sanitizedName = validated.name ? sanitizeName(validated.name) : null;
      updateData.name = sanitizedName;
    }

    if (validated.preferredLocale !== undefined) {
      updateData.preferredLocale = validated.preferredLocale;
    }

    if (validated.email !== undefined && validated.email !== session.user?.email) {
      const sanitizedEmail = sanitizeEmail(validated.email);
      
      if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });

      if (existingUser && existingUser.id !== session.user?.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }

      updateData.email = sanitizedEmail;
      updateData.emailVerified = false;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user?.id || '' },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        preferredLocale: true,
        updatedAt: true,
      },
    });

    if (updateData.name !== undefined || updateData.email !== undefined) {
      try {
        const locale = updatedUser.preferredLocale || 'tr';
        const { subject, htmlBody, textBody } = getProfileUpdateEmailTemplate(locale);
        await sendEmail({
          to: updatedUser.email,
          subject,
          body: textBody,
          htmlBody,
        });
      } catch (emailError) {
        logApiError('/api/user/profile', emailError, { step: 'send_update_email', email: updatedUser.email });
      }
    }

    const origin = request.headers.get('origin');
    return NextResponse.json(updatedUser, {
      headers: getCorsHeaders(origin),
    });
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
    logApiError('/api/user/profile', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}
