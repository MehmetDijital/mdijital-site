import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  titleTR: z.string().min(1).max(255),
  titleEN: z.string().min(1).max(255),
  descriptionTR: z.string().min(1),
  descriptionEN: z.string().min(1),
  location: z.string().max(255).optional().nullable(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']).optional().nullable(),
  published: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const data = createSchema.parse(body);
    const job = await prisma.jobPosting.create({
      data: {
        titleTR: data.titleTR,
        titleEN: data.titleEN,
        descriptionTR: data.descriptionTR,
        descriptionEN: data.descriptionEN,
        location: data.location ?? undefined,
        jobType: data.jobType ?? undefined,
        published: data.published ?? false,
      },
    });
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
