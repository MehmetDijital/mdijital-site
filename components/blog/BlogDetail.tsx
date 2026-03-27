'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Calendar, Eye, Heart, MessageCircle, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import Image from 'next/image';
import { SocialShare } from './SocialShare';
import { CommentSection } from './CommentSection';
import { sanitizeHTMLClient } from '@/lib/sanitize';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

interface BlogDetailProps {
  slug: string;
  locale: string;
}

export function BlogDetail({ slug, locale }: BlogDetailProps) {
  const t = useTranslations('blog');
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/${slug}?locale=${locale}`);
      if (!response.ok) {
        router.push('/blog');
        return;
      }
      const data = await response.json();
      setPost(data);
      setLiked(data.userLiked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  }, [slug, locale, router]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    try {
      const response = await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const dateLocale = locale === 'tr' ? tr : enUS;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          {t('backToBlog')}
        </Link>

        {post.featuredImage && (
          <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <article className="glass-panel rounded-xl p-8 border border-white/10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-text-green">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author.name || post.author.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {post.publishedAt
                  ? format(new Date(post.publishedAt), 'PP', { locale: dateLocale })
                  : format(new Date(post.createdAt), 'PP', { locale: dateLocale })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{post.views}</span>
            </div>
          </div>

          <div
            className="prose prose-invert prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: sanitizeHTMLClient(post.content) }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  liked
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Heart size={18} className={liked ? 'fill-current' : ''} />
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <MessageCircle size={18} />
                <span>{post.commentsCount}</span>
              </div>
            </div>

            <SocialShare url={currentUrl} title={post.title} locale={locale} />
          </div>
        </article>

        <CommentSection blogSlug={slug} locale={locale} />
      </div>
    </div>
  );
}

