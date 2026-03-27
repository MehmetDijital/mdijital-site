'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { RichTextEditor } from './RichTextEditor';
import { Save, Eye, X } from 'lucide-react';

interface AdminBlogEditorProps {
  slug?: string;
}

export function AdminBlogEditor({ slug }: AdminBlogEditorProps) {
  const t = useTranslations('blog.admin');
  const router = useRouter();
  const locale = useLocale();
  const isEdit = !!slug;

  const [titleTR, setTitleTR] = useState('');
  const [titleEN, setTitleEN] = useState('');
  const [contentTR, setContentTR] = useState('');
  const [contentEN, setContentEN] = useState('');
  const [excerptTR, setExcerptTR] = useState('');
  const [excerptEN, setExcerptEN] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        router.push('/admin/blog');
        return;
      }
      const data = await response.json();
      const trRes = await fetch(`/api/blog/${slug}?locale=tr`);
      const enRes = await fetch(`/api/blog/${slug}?locale=en`);
      const trData = trRes.ok ? await trRes.json() : {};
      const enData = enRes.ok ? await enRes.json() : {};

      setTitleTR(trData.title ?? data.title ?? '');
      setTitleEN(enData.title ?? data.title ?? '');
      setContentTR(trData.content ?? data.content ?? '');
      setContentEN(enData.content ?? data.content ?? '');
      setExcerptTR(trData.excerpt ?? '');
      setExcerptEN(enData.excerpt ?? '');
      setFeaturedImage(data.featuredImage || trData.featuredImage || '');
      setPublished(!!(data.published ?? trData.published));
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (isEdit) {
      fetchPost();
    }
  }, [isEdit, fetchPost]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/blog/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || t('errorUploadFailed'));
        return;
      }
      const d = await res.json();
      if (d.url) setFeaturedImage(d.url);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!titleTR.trim() && !titleEN.trim()) {
      setError(t('errorTitleRequired'));
      return;
    }
    if (!contentTR.trim() && !contentEN.trim()) {
      setError('At least one language must have content');
      return;
    }
    setSaving(true);

    try {
      const url = isEdit ? `/api/blog/${slug}` : '/api/blog';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleTR: titleTR.trim() || null,
          titleEN: titleEN.trim() || null,
          contentTR: contentTR.trim() || null,
          contentEN: contentEN.trim() || null,
          excerptTR: excerptTR.trim() || null,
          excerptEN: excerptEN.trim() || null,
          featuredImage: featuredImage.trim() || null,
          published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('saveError'));
        return;
      }

      const data = await response.json();
      router.push(`/admin/blog`);
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isEdit ? t('editTitle') : t('newTitle')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Turkish Content */}
          <div className="glass-panel rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-neon-green">🇹🇷 Türkçe İçerik</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('title')} (TR)</label>
                <input
                  type="text"
                  value={titleTR}
                  onChange={(e) => setTitleTR(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-green outline-none transition-colors"
                  maxLength={200}
                  placeholder={t('placeholderTitleTR')}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('excerpt')} (TR)</label>
                <textarea
                  value={excerptTR}
                  onChange={(e) => setExcerptTR(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-green outline-none transition-colors min-h-[100px] resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('content')} (TR)</label>
                {mounted ? (
                  <RichTextEditor
                    key="tr"
                    editorKey="tr"
                    content={contentTR}
                    onChange={setContentTR}
                    placeholder="Türkçe içeriğinizi yazın..."
                    locale="tr"
                  />
                ) : (
                  <div className="border border-gray-700 rounded-lg bg-black/50 min-h-[300px] p-4 flex items-center justify-center text-gray-500" aria-hidden />
                )}
              </div>
            </div>
          </div>

          {/* English Content */}
          <div className="glass-panel rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-neon-green">🇬🇧 English Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('title')} (EN)</label>
                <input
                  type="text"
                  value={titleEN}
                  onChange={(e) => setTitleEN(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-green outline-none transition-colors"
                  maxLength={200}
                  placeholder={t('placeholderTitleEN')}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('excerpt')} (EN)</label>
                <textarea
                  value={excerptEN}
                  onChange={(e) => setExcerptEN(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-neon-green outline-none transition-colors min-h-[100px] resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('content')} (EN)</label>
                {mounted ? (
                  <RichTextEditor
                    key="en"
                    editorKey="en"
                    content={contentEN}
                    onChange={setContentEN}
                    placeholder={t('placeholderContentEN')}
                    locale="en"
                  />
                ) : (
                  <div className="border border-gray-700 rounded-lg bg-black/50 min-h-[300px] p-4 flex items-center justify-center text-gray-500" aria-hidden />
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="glass-panel rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">{t('settings')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('featuredImage')}</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-neon-green file:text-black file:font-medium disabled:opacity-50"
                />
                {uploading && <p className="text-sm text-gray-400 mt-1">Uploading…</p>}
                {featuredImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={featuredImage.startsWith('http') ? featuredImage : (typeof window !== 'undefined' ? window.location.origin : '') + featuredImage}
                      alt=""
                      width={96}
                      height={96}
                      className="h-24 w-auto object-contain rounded border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 rounded bg-black/50 border-gray-700 text-neon-green focus:ring-neon-green"
                />
                <label htmlFor="published" className="text-white cursor-pointer">
                  {t('publish')}
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-neon-green text-black font-bold rounded-lg hover:bg-[#32cc12] transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? t('saving') : t('save')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

