import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-helpers';
import { headers } from 'next/headers';
import { logApiError } from '@/lib/logger';

// POST - Toggle like on blog post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const session = await auth();
    const headersList = await headers();

    // Get blog post
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (!blogPost.published) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Get user IP and user agent for anonymous likes
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    if (session?.user?.id) {
      // Authenticated user like
      const existingLike = await prisma.blogLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: blogPost.id,
            userId: session.user.id,
          },
        },
      });

      if (existingLike) {
        // Unlike
        await prisma.blogLike.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({ liked: false });
      } else {
        // Like
        await prisma.blogLike.create({
          data: {
            blogPostId: blogPost.id,
            userId: session.user.id,
          },
        });
        return NextResponse.json({ liked: true });
      }
    } else {
      // Anonymous like (by IP)
      // Check if this IP already liked
      const existingLike = await prisma.blogLike.findFirst({
        where: {
          blogPostId: blogPost.id,
          userId: null,
          ipAddress,
        },
      });

      if (existingLike) {
        // Unlike
        await prisma.blogLike.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({ liked: false });
      } else {
        // Like
        await prisma.blogLike.create({
          data: {
            blogPostId: blogPost.id,
            ipAddress,
            userAgent,
          },
        });
        return NextResponse.json({ liked: true });
      }
    }
  } catch (error) {
    logApiError('/api/blog/[slug]/like', error, { method: 'POST', slug });
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET - Check if user/IP liked the post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const session = await auth();
    const headersList = await headers();

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    let liked = false;

    if (session?.user?.id) {
      const like = await prisma.blogLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId: blogPost.id,
            userId: session.user.id,
          },
        },
      });
      liked = !!like;
    } else {
      const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
      const like = await prisma.blogLike.findFirst({
        where: {
          blogPostId: blogPost.id,
          userId: null,
          ipAddress,
        },
      });
      liked = !!like;
    }

    return NextResponse.json({ liked });
  } catch (error) {
    logApiError('/api/blog/[slug]/like', error, { method: 'GET', slug });
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    );
  }
}

