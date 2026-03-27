import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';

const updateSchema = z.object({
  status: z.enum(['Received', 'In Progress', 'Completed']),
  adminNotes: z.string().optional(),
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

    const projectRequest = await prisma.projectRequest.update({
      where: { id },
      data: {
        status: validated.status,
        adminNotes: validated.adminNotes,
      },
    });

    return NextResponse.json(projectRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    logApiError('/api/admin/requests/[id]', error, { id });
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

