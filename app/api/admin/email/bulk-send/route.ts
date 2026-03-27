import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/ses';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';

const bulkSendSchema = z.object({
  mode: z.enum(['all', 'selected']),
  emails: z.array(z.string().email()).optional(),
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
    const validated = bulkSendSchema.parse(body);

    const subject = sanitizeText(validated.subject.trim());
    const message = sanitizeText(validated.message.trim());
    const htmlBody = message.replace(/\n/g, '<br>');

    let recipients: string[] = [];
    if (validated.mode === 'all') {
      const subs = await prisma.newsletterSubscription.findMany({
        where: { subscribed: true },
        select: { email: true },
      });
      recipients = [...new Set(subs.map((s) => s.email.trim().toLowerCase()))];
    } else if (validated.mode === 'selected' && Array.isArray(validated.emails) && validated.emails.length > 0) {
      recipients = [...new Set(validated.emails.map((e) => e.trim().toLowerCase()))];
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: validated.mode === 'all' ? 'No subscribers found' : 'No recipients selected' },
        { status: 400 }
      );
    }

    let sent = 0;
    let failed = 0;
    for (const to of recipients) {
      try {
        await sendEmail({
          to,
          subject,
          body: message,
          htmlBody,
        });
        sent++;
      } catch (err) {
        failed++;
        logApiError('/api/admin/email/bulk-send', err, { to });
      }
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    logApiError('/api/admin/email/bulk-send', error, { action: 'bulk_send' });
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
