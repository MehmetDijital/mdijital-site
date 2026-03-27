import { NextResponse } from 'next/server';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'https://mdijital.io',
      'https://www.mdijital.io',
      'https://api.mdijital.io',
      'https://admin.mdijital.io',
    ];

const isProduction = process.env.NODE_ENV === 'production';

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && (allowedOrigins.includes(origin) || !isProduction)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (!isProduction) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  }

  return headers;
}

export function handleCors(request: Request): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const headers = getCorsHeaders(origin);
    return new NextResponse(null, { status: 204, headers });
  }
  return null;
}
