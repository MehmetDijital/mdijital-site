const DEFAULT_BASE = 'https://mdijital.io';

function isValidAbsoluteUrl(s: string | undefined): boolean {
  if (!s || typeof s !== 'string') return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSafeBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? '';
  return isValidAbsoluteUrl(env) ? env.trim() : DEFAULT_BASE;
}

export function getSafeMetadataBase(): URL {
  return new URL(getSafeBaseUrl());
}
