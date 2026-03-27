'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export function AdminBlogList() {
  const t = useTranslations('blog.admin');
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blog?limit=100');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    setDeleting(slug);
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.slug !== slug));
      }
    } catch (error) {
      console.error('Failed to delete blog post:', error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">{t('listTitle') || 'Blog Posts'}</h1>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-6 py-3 bg-neon-green text-black font-bold rounded-lg hover:bg-[#32cc12] transition-colors"
          >
            <Plus size={20} />
            {t('newPost') || 'New Post'}
          </Link>
        </div>

        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-gray-400 font-semibold">Title</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Status</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Views</th>
                <th className="text-left p-4 text-gray-400 font-semibold">Date</th>
                <th className="text-right p-4 text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <Link
                      href={`/admin/blog/${post.slug}/edit`}
                      className="text-white hover:text-neon-green transition-colors font-medium"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{post.views}</td>
                  <td className="p-4 text-gray-400">
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), 'PP', { locale: tr })
                      : format(new Date(post.createdAt), 'PP', { locale: tr })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-neon-green"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={deleting === post.slug}
                        className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <p>No blog posts yet. Create your first post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

