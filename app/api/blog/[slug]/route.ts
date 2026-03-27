import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { sanitizeHTML } from '@/lib/security';
import { logApiError } from '@/lib/logger';

// GET - Get single blog post by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'tr';

    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';

    const post = await prisma.blogPost.findUnique({
      where: { slug },
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
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Check if user can view unpublished posts
    if (!post.published && !isAdmin) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    // Check if user liked this post
    let userLiked = false;
    if (session?.user?.id) {
      const like = await prisma.blogLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: post.id,
            userId: session.user.id,
          },
        },
      });
      userLiked = !!like;
    }

    const formattedPost = {
      id: post.id,
      slug: post.slug,
      title: (locale === 'tr' ? post.titleTR : post.titleEN) || post.titleTR || post.titleEN || '',
      content: (locale === 'tr' ? post.contentTR : post.contentEN) || post.contentTR || post.contentEN || '',
      excerpt: (locale === 'tr' ? post.excerptTR : post.excerptEN) ?? post.excerptTR ?? post.excerptEN ?? null,
      featuredImage: post.featuredImage,
      published: post.published,
      publishedAt: post.publishedAt,
      views: post.views + 1, // Include the increment
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      userLiked,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    logApiError('/api/blog/[slug]', error, { method: 'GET', slug });
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update blog post (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();

    const updateSchema = z.object({
      titleTR: z.string().max(200).optional().nullable(),
      titleEN: z.string().max(200).optional().nullable(),
      contentTR: z.string().optional().nullable(),
      contentEN: z.string().optional().nullable(),
      excerptTR: z.string().max(500).optional().nullable(),
      excerptEN: z.string().max(500).optional().nullable(),
      featuredImage: z.string().max(1000).optional().nullable(),
      published: z.boolean().optional(),
    });

    const validated = updateSchema.parse(body);

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Update publishedAt if publishing for the first time
    const publishedAt =
      validated.published === true && !existingPost.published
        ? new Date()
        : existingPost.publishedAt;

    const updateData: Record<string, unknown> = {};
    if (validated.titleTR !== undefined) updateData.titleTR = validated.titleTR?.trim() || null;
    if (validated.titleEN !== undefined) updateData.titleEN = validated.titleEN?.trim() || null;
    if (validated.contentTR !== undefined) updateData.contentTR = validated.contentTR?.trim() ? sanitizeHTML(validated.contentTR.trim()) : null;
    if (validated.contentEN !== undefined) updateData.contentEN = validated.contentEN?.trim() ? sanitizeHTML(validated.contentEN.trim()) : null;
    if (validated.excerptTR !== undefined) updateData.excerptTR = validated.excerptTR?.trim() || null;
    if (validated.excerptEN !== undefined) updateData.excerptEN = validated.excerptEN?.trim() || null;
    if (validated.featuredImage !== undefined) updateData.featuredImage = validated.featuredImage?.trim() || null;
    if (validated.published !== undefined) {
      updateData.published = validated.published;
      updateData.publishedAt = publishedAt;
    }

    const mergedTitleTR = ((updateData.titleTR !== undefined ? updateData.titleTR : existingPost.titleTR) ?? null) as string | null;
    const mergedTitleEN = ((updateData.titleEN !== undefined ? updateData.titleEN : existingPost.titleEN) ?? null) as string | null;
    const mergedContentTR = ((updateData.contentTR !== undefined ? updateData.contentTR : existingPost.contentTR) ?? null) as string | null;
    const mergedContentEN = ((updateData.contentEN !== undefined ? updateData.contentEN : existingPost.contentEN) ?? null) as string | null;
    if (!(mergedTitleTR?.trim() || mergedTitleEN?.trim()) || !(mergedContentTR?.trim() || mergedContentEN?.trim())) {
      return NextResponse.json(
        { error: 'At least one language must have title and content' },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: updateData,
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    logApiError('/api/blog/[slug]', error, { method: 'PUT', slug });
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.blogPost.delete({
      where: { slug },
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    logApiError('/api/blog/[slug]', error, { method: 'DELETE', slug });
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

