import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { csrfProtection } from '@/lib/csrf';
import { logApiError } from '@/lib/logger';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_BYTES = 5 * 1024 * 1024;

function uniqueName(ext: string): string {
  return `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
}

const applySchema = z.object({
  jobPostingId: z.string().min(1),
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  coverLetter: z.string().trim().max(5000).optional().or(z.literal('')),
});

const CAREERS_APPLY_RATE_LIMIT = 10;
const CAREERS_APPLY_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const csrfRes = await csrfProtection(request as NextRequest);
  if (csrfRes) return csrfRes;

  try {
    const headersList = await headers();
    const ipAddress = getClientIp(headersList);
    const rateLimitKey = `careers_apply:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, CAREERS_APPLY_RATE_LIMIT, CAREERS_APPLY_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many applications. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const jobPostingId = formData.get('jobPostingId') as string | null;
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = (formData.get('phone') as string | null) || undefined;
    const coverLetter = (formData.get('coverLetter') as string | null) || undefined;
    const cv = formData.get('cv') as File | null;

    const parsed = applySchema.safeParse({
      jobPostingId: (jobPostingId ?? '').trim(),
      name: (name ?? '').trim(),
      email: (email ?? '').trim().toLowerCase(),
      phone: phone?.trim() || '',
      coverLetter: coverLetter?.trim() || '',
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosting.findFirst({
      where: { id: parsed.data.jobPostingId, published: true },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found or not open' }, { status: 404 });
    }

    const existing = await prisma.jobApplication.findFirst({
      where: {
        jobPostingId: job.id,
        email: { equals: parsed.data.email, mode: 'insensitive' },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'duplicate', code: 'DUPLICATE_APPLICATION' },
        { status: 409 }
      );
    }

    if (!cv || !(cv instanceof File) || cv.size === 0) {
      return NextResponse.json({ error: 'CV file is required' }, { status: 400 });
    }
    const baseName = path.basename(cv.name || '');
    const ext = path.extname(baseName).toLowerCase();
    const allowedExt = ['.pdf', '.doc', '.docx'];
    const typeOk = ALLOWED_TYPES.includes(cv.type) || (cv.type === '' && allowedExt.includes(ext));
    if (!typeOk || !allowedExt.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use PDF or Word (DOC/DOCX).' },
        { status: 400 }
      );
    }
    if (cv.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB.' },
        { status: 400 }
      );
    }

    const fileExt = path.extname(baseName).toLowerCase() || (cv.type?.includes('pdf') ? '.pdf' : '.doc');
    const safeExt = ['.pdf', '.doc', '.docx'].includes(fileExt) ? fileExt : '.pdf';
    const filename = uniqueName(safeExt);
    const dir = path.join(process.cwd(), 'public', 'uploads', 'careers');
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    const bytes = await cv.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    const cvPath = `/uploads/careers/${filename}`;

    await prisma.jobApplication.create({
      data: {
        jobPostingId: job.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone?.trim() ? parsed.data.phone.trim() : null,
        coverLetter: parsed.data.coverLetter?.trim() ? parsed.data.coverLetter.trim() : null,
        cvPath,
        status: 'New',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('/api/careers/apply', error);
    return NextResponse.json(
      { error: 'Application failed' },
      { status: 500 }
    );
  }
}
