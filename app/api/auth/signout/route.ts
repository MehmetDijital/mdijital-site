import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth-helpers';

export async function POST() {
  try {
    await signOut({ redirect: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
}
