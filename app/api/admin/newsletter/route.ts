import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logApiError } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageRaw = parseInt(searchParams.get('page') || '1', 10);
    const limitRaw = parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(limitRaw, 100) : 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      const sanitizedSearch = sanitizeText(search);
      where.email = {
        contains: sanitizedSearch,
        mode: 'insensitive',
      };
    }

    if (status === 'subscribed') {
      where.subscribed = true;
    } else if (status === 'unsubscribed') {
      where.subscribed = false;
    }

    const [subscriptions, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          subscribed: true,
          locale: true,
          subscribedAt: true,
          unsubscribedAt: true,
          createdAt: true,
        },
      }),
      prisma.newsletterSubscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logApiError('/api/admin/newsletter', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscriptions' },
      { status: 500 }
    );
  }
}
