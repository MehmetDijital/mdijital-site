'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Calendar, Eye, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import Image from 'next/image';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

interface BlogListProps {
  locale: string;
  page: number;
}

export function BlogList({ locale, page }: BlogListProps) {
  const t = useTranslations('blog');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog?locale=${locale}&page=${page}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  }, [locale, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const dateLocale = locale === 'tr' ? tr : enUS;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-400 text-lg">{t('noPosts')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 neon-text-green">{t('title')}</h1>
          <p className="text-gray-400 text-lg">{t('description')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass-panel rounded-xl overflow-hidden border border-white/10 hover:border-neon-green/50 transition-all hover:transform hover:scale-105 group"
            >
              {post.featuredImage && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-neon-green transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), 'PP', { locale: dateLocale })
                      : format(new Date(post.createdAt), 'PP', { locale: dateLocale })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {post.views}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      {post.likesCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      {post.commentsCount}
                    </div>
                  </div>
                  <ArrowRight className="text-neon-green group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/blog?page=${pageNum}`}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pageNum === pagination.page
                    ? 'bg-neon-green text-black font-bold'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

