import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';
import { handleCors, getCorsHeaders } from '@/lib/cors';

export async function GET(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const checks: Record<string, string> = {};
  let allHealthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch (error) {
    checks.database = 'unhealthy';
    allHealthy = false;
  }

  try {
    const redis = getRedisClient();
    await redis.ping();
    checks.redis = 'healthy';
  } catch (error) {
    checks.redis = 'unhealthy';
  }

  const origin = request.headers.get('origin');
  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: allHealthy ? 200 : 503,
      headers: getCorsHeaders(origin),
    }
  );
}

