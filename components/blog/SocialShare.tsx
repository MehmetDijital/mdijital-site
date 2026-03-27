'use client';

import { Share2, Facebook, Linkedin, MessageCircle } from 'lucide-react';

// X (Twitter) Icon Component
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface SocialShareProps {
  url: string;
  title: string;
  locale?: string;
}

export function SocialShare({ url, title, locale = 'tr' }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const shareUrl = shareLinks[platform];
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      const nav = window.navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> };
      
      if (nav.share) {
        try {
          await nav.share({
            title,
            url,
          });
        } catch (err) {
          // User cancelled or error
        }
      } else if (nav.clipboard) {
        // Fallback: copy to clipboard
        await nav.clipboard.writeText(url);
        alert(locale === 'tr' ? 'Link kopyalandı!' : 'Link copied!');
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400">
        {locale === 'tr' ? 'Paylaş:' : 'Share:'}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          aria-label="Share on X (Twitter)"
          title="Share on X"
        >
          <XIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-blue-500"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-blue-600"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </button>
        {typeof window !== 'undefined' && 'navigator' in window && 'share' in window.navigator && (
          <button
            onClick={handleNativeShare}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-neon-green"
            aria-label="Share"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

