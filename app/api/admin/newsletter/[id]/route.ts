import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logApiError } from '@/lib/logger';

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

    await prisma.newsletterSubscription.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Newsletter subscription deleted successfully',
    });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Newsletter subscription not found' },
        { status: 404 }
      );
    }

    logApiError('/api/admin/newsletter/[id]', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter subscription' },
      { status: 500 }
    );
  }
}
