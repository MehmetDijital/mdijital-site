import { getRedisClient } from './redis';
import logger from './logger';

// Re-export sanitize functions from sanitize.ts for backward compatibility
export { sanitizeHTML, sanitizeText } from './sanitize';

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
  const first = forwarded.split(',')[0]?.trim();
  return first || 'unknown';
}

/**
 * Rate limiting using Redis
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const redis = getRedisClient();
    const now = Date.now();
    const redisKey = `rate_limit:${key}`;
    
    // Get current count
    const count = await redis.incr(redisKey);
    
    // Set expiration on first request
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }
    
    // Get TTL to calculate reset time
    const ttl = await redis.pttl(redisKey);
    const resetAt = now + (ttl > 0 ? ttl : windowMs);
    
    if (count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }
    
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - count),
      resetAt,
    };
  } catch (error) {
    // Fallback to allowing request if Redis fails
    logger.error({ error, key }, 'Rate limit check failed, allowing request');
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: Date.now() + windowMs,
    };
  }
}

