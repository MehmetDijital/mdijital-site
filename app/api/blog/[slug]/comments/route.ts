import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { sanitizeText, checkRateLimit } from '@/lib/security';
import { headers } from 'next/headers';
import { logApiError } from '@/lib/logger';
import { handleCors, getCorsHeaders } from '@/lib/cors';

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// GET - Get comments for a blog post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const { slug } = await params;
  
  try {

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        blogPostId: blogPost.id,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const origin = request.headers.get('origin');
    return NextResponse.json(comments, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    const origin = request.headers.get('origin');
    logApiError('/api/blog/[slug]/comments', error, { method: 'GET', slug });
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

// POST - Create comment (authenticated users only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const { slug } = await params;
  
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const validated = createCommentSchema.parse(body);

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Rate limiting: max 10 comments per hour per user
    const rateLimitKey = `comment:${session.user.id}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      );
    }

    // Sanitize content (plain text only, no HTML)
    const sanitizedContent = sanitizeText(validated.content);

    const comment = await prisma.comment.create({
      data: {
        blogPostId: blogPost.id,
        userId: session.user.id,
        content: sanitizedContent,
        approved: true, // Auto-approve for now, can add moderation later
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const origin = request.headers.get('origin');
    return NextResponse.json(comment, {
      status: 201,
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

    logApiError('/api/blog/[slug]/comments', error, { method: 'POST', slug });
    return NextResponse.json(
      { error: 'Failed to create comment' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

