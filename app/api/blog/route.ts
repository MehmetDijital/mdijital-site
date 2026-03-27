import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { sanitizeHTML } from '@/lib/security';
import { logApiError } from '@/lib/logger';
import { sanitizeText } from '@/lib/sanitize';
import { handleCors, getCorsHeaders } from '@/lib/cors';

const createBlogSchema = z
  .object({
    titleTR: z.string().max(200).optional().nullable(),
    titleEN: z.string().max(200).optional().nullable(),
    contentTR: z.string().optional().nullable(),
    contentEN: z.string().optional().nullable(),
    excerptTR: z.string().max(500).optional().nullable(),
    excerptEN: z.string().max(500).optional().nullable(),
    featuredImage: z.string().max(1000).optional().nullable(),
    published: z.boolean().default(false),
  })
  .refine((d) => (d.titleTR?.trim() || d.titleEN?.trim()) && (d.contentTR?.trim() || d.contentEN?.trim()), {
    message: 'At least one language must have title and content',
  });

// GET - List all published blog posts (public) or all posts (admin)
export async function GET(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'tr';
    const pageRaw = parseInt(searchParams.get('page') || '1', 10);
    const limitRaw = parseInt(searchParams.get('limit') || '10', 10);
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(limitRaw, 100) : 10;
    const skip = (page - 1) * limit;

    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const where = isAdmin ? {} : { published: true };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: (locale === 'tr' ? post.titleTR : post.titleEN) || post.titleTR || post.titleEN || '',
      content: (locale === 'tr' ? post.contentTR : post.contentEN) || post.contentTR || post.contentEN || '',
      excerpt: (locale === 'tr' ? post.excerptTR : post.excerptEN) ?? post.excerptTR ?? post.excerptEN ?? null,
      featuredImage: post.featuredImage,
      published: post.published,
      publishedAt: post.publishedAt,
      views: post.views,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    const origin = request.headers.get('origin');
    return NextResponse.json(
      {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    const origin = request.headers.get('origin');
    logApiError('/api/blog', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

// POST - Create new blog post (admin only)
export async function POST(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createBlogSchema.parse(body);

    const sanitizedTitleTR = (validated.titleTR != null && validated.titleTR.trim()) ? sanitizeText(validated.titleTR.trim()).slice(0, 200) : null;
    const sanitizedTitleEN = (validated.titleEN != null && validated.titleEN.trim()) ? sanitizeText(validated.titleEN.trim()).slice(0, 200) : null;
    const sanitizedExcerptTR = (validated.excerptTR != null && validated.excerptTR.trim()) ? sanitizeText(validated.excerptTR.trim()).slice(0, 500) : null;
    const sanitizedExcerptEN = (validated.excerptEN != null && validated.excerptEN.trim()) ? sanitizeText(validated.excerptEN.trim()).slice(0, 500) : null;

    const slugSource = sanitizedTitleTR || sanitizedTitleEN || 'post';
    const baseSlug = slugSource
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u024F]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post';

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const sanitizedContentTR = (validated.contentTR != null && validated.contentTR.trim()) ? sanitizeHTML(validated.contentTR.trim()) : null;
    const sanitizedContentEN = (validated.contentEN != null && validated.contentEN.trim()) ? sanitizeHTML(validated.contentEN.trim()) : null;

    const blogPost = await prisma.blogPost.create({
      data: {
        authorId: session.user.id,
        slug,
        titleTR: sanitizedTitleTR,
        titleEN: sanitizedTitleEN,
        contentTR: sanitizedContentTR,
        contentEN: sanitizedContentEN,
        excerptTR: sanitizedExcerptTR,
        excerptEN: sanitizedExcerptEN,
        featuredImage: (validated.featuredImage != null && validated.featuredImage.trim()) ? validated.featuredImage.trim() : null,
        published: validated.published,
        publishedAt: validated.published ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const origin = request.headers.get('origin');
    return NextResponse.json(blogPost, {
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

    logApiError('/api/blog', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

