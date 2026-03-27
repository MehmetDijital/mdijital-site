'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Palette,
  Highlighter,
} from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';

function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  locale?: string;
  editorKey?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  locale = 'tr',
  editorKey = 'default',
}: RichTextEditorProps) {
  const linkName = editorKey === 'default' ? 'link' : `link-${editorKey}`;
  const underlineName = editorKey === 'default' ? 'underline' : `underline-${editorKey}`;
  const setLinkCmd = (editorKey === 'default' ? 'setLink' : `setLink${capitalize(editorKey)}`) as 'setLink' | string;
  const unsetLinkCmd = (editorKey === 'default' ? 'unsetLink' : `unsetLink${capitalize(editorKey)}`) as 'unsetLink' | string;
  const toggleUnderlineCmd = (editorKey === 'default' ? 'toggleUnderline' : `toggleUnderline${capitalize(editorKey)}`) as 'toggleUnderline' | string;

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.extend({ name: linkName }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neon-green hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || (locale === 'tr' ? 'İçeriğinizi yazın...' : 'Write your content...'),
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline.extend({ name: underlineName }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    [linkName, underlineName, placeholder, locale]
  );

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes(linkName).href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      const chain = editor.chain().focus().extendMarkRange(linkName) as unknown as Record<string, (arg?: unknown) => ReturnType<typeof editor.chain>>;
      chain[unsetLinkCmd]?.()?.run();
      return;
    }

    const chainWithUrl = editor.chain().focus().extendMarkRange(linkName) as unknown as Record<string, (arg?: unknown) => ReturnType<typeof editor.chain>>;
    chainWithUrl[setLinkCmd]?.({ href: url })?.run();
  }, [editor, linkName, setLinkCmd, unsetLinkCmd]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImage = useCallback(() => {
    if (!editor) return;
    imageInputRef.current?.click();
  }, [editor]);

  const onImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !file.type.startsWith('image/') || !editor) return;
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/blog/upload', { method: 'POST', body: formData });
        if (!res.ok) return;
        const d = await res.json();
        const url = typeof d?.url === 'string' ? d.url : '';
        if (url) {
          const abs = url.startsWith('http') ? url : (typeof window !== 'undefined' ? window.location.origin : '') + url;
          editor.chain().focus().setImage({ src: abs }).run();
        }
      } catch {
        /* ignore */
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-700 rounded-lg bg-black/50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-700">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('bold') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('italic') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              const chain = editor.chain().focus() as unknown as Record<string, () => ReturnType<typeof editor.chain>>;
              chain[toggleUnderlineCmd]?.()?.run();
            }}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive(underlineName) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('strike') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('code') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Code"
          >
            <Code size={18} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('bulletList') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('orderedList') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('blockquote') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Quote"
          >
            <Quote size={18} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onImageFileChange}
          />
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive(linkName) ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Link"
          >
            <LinkIcon size={18} />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400"
            title="Image"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => {
              const color = window.prompt('Color (hex)', '#39ff14');
              if (color) {
                editor.chain().focus().setColor(color).run();
              }
            }}
            className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400"
            title="Text Color"
          >
            <Palette size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              const color = window.prompt('Highlight Color (hex)', '#ffff00');
              if (color) {
                editor.chain().focus().toggleHighlight({ color }).run();
              }
            }}
            className={`p-2 rounded hover:bg-white/10 transition-colors ${
              editor.isActive('highlight') ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400'
            }`}
            title="Highlight"
          >
            <Highlighter size={18} />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="prose prose-invert max-w-none" />
    </div>
  );
}

