let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch('/api/csrf', { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Failed to get CSRF token');
  const data = await res.json();
  const token = (data.token ?? '') as string;
  cachedToken = token;
  return token;
}
