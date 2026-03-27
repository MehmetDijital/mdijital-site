import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { sendEmail } from '@/lib/ses';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = sendEmailSchema.parse(body);

    const sanitizedSubject = sanitizeText(validated.subject.trim());
    const sanitizedMessage = sanitizeText(validated.message.trim());

    await sendEmail({
      to: validated.to.trim().toLowerCase(),
      subject: sanitizedSubject,
      body: sanitizedMessage,
      htmlBody: sanitizedMessage.replace(/\n/g, '<br>'),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('/api/admin/email/send', error, { action: 'send_email' });
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
