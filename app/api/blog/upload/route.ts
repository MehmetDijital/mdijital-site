import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { logApiError } from '@/lib/logger';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_BYTES = 5 * 1024 * 1024;

function uniqueName(ext: string): string {
  return `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const baseName = path.basename(file.name || '');
    const ext = path.extname(baseName).toLowerCase();
    const typeOk = ALLOWED_TYPES.includes(file.type) || (file.type === '' && ALLOWED_EXT.includes(ext));
    if (!typeOk || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid type. Use JPEG, PNG, WebP or GIF.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB.' },
        { status: 400 }
      );
    }

    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '.jpg';
    const name = uniqueName(safeExt);
    const dir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/blog/${name}`;
    return NextResponse.json({ url });
  } catch (error) {
    logApiError('/api/blog/upload', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
