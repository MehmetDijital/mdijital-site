'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, Send } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface CommentSectionProps {
  blogSlug: string;
  locale: string;
}

export function CommentSection({ blogSlug, locale }: CommentSectionProps) {
  const t = useTranslations('blog.comments');
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      setIsAuthenticated(!!session?.user);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/${blogSlug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [blogSlug]);

  useEffect(() => {
    checkAuth();
    fetchComments();
  }, [blogSlug, checkAuth, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blog/${blogSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment.trim() }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setComment('');
      } else if (response.status === 401) {
        router.push(`/auth/login?redirect=/blog/${blogSlug}`);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const dateLocale = locale === 'tr' ? tr : enUS;

  return (
    <div className="mt-12 glass-panel rounded-xl p-8 border border-white/10">
      <h2 className="text-3xl font-bold mb-6">{t('title')}</h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white focus:border-neon-green outline-none transition-colors min-h-[100px] resize-none"
            required
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-400">
              {comment.length}/2000
            </span>
            <button
              type="submit"
              disabled={!comment.trim() || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-neon-green text-black font-bold rounded-lg hover:bg-[#32cc12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {submitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <p className="text-gray-400 mb-4">{t('loginRequired')}</p>
          <a
            href={`/auth/login?redirect=/blog/${blogSlug}`}
            className="inline-block px-6 py-2 bg-neon-green text-black font-bold rounded-lg hover:bg-[#32cc12] transition-colors"
          >
            {t('login')}
          </a>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-8">{t('loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{t('noComments')}</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-black/30 rounded-lg border border-white/10"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <User size={20} className="text-neon-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {comment.user.name || comment.user.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), 'PPp', { locale: dateLocale })}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

