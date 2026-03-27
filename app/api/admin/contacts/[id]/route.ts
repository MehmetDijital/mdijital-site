import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/ses';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';

const updateSchema = z.object({
  status: z.enum(['New', 'In Progress', 'Replied', 'Archived']).optional(),
  adminNotes: z.string().optional(),
});

const replySchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const contact = await prisma.contactSubmission.update({
      where: { id },
      data: {
        status: validated.status,
        adminNotes: validated.adminNotes ? sanitizeText(validated.adminNotes) : undefined,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    logApiError('/api/admin/contacts/[id]', error, { id });
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = replySchema.parse(body);

    const contact = await prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (!contact.email) {
      return NextResponse.json(
        { error: 'Contact has no email address' },
        { status: 400 }
      );
    }

    const sanitizedSubject = sanitizeText(validated.subject.trim());
    const sanitizedMessage = sanitizeText(validated.message.trim());

    await sendEmail({
      to: contact.email,
      subject: sanitizedSubject,
      body: sanitizedMessage,
      htmlBody: sanitizedMessage.replace(/\n/g, '<br>'),
    });

    await prisma.contactSubmission.update({
      where: { id },
      data: {
        status: 'Replied',
        repliedAt: new Date(),
        repliedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    logApiError('/api/admin/contacts/[id]', error, { id, action: 'reply' });
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}
