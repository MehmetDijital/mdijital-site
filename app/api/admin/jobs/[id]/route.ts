import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  titleTR: z.string().min(1).max(255).optional(),
  titleEN: z.string().min(1).max(255).optional(),
  descriptionTR: z.string().min(1).optional(),
  descriptionEN: z.string().min(1).optional(),
  location: z.string().max(255).optional().nullable(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']).optional().nullable(),
  published: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const job = await prisma.jobPosting.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);
    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...(data.titleTR != null && { titleTR: data.titleTR }),
        ...(data.titleEN != null && { titleEN: data.titleEN }),
        ...(data.descriptionTR != null && { descriptionTR: data.descriptionTR }),
        ...(data.descriptionEN != null && { descriptionEN: data.descriptionEN }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.jobType !== undefined && { jobType: data.jobType }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await prisma.jobPosting.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
