import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { logApiError, logSecurityEvent } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const adminLoginSchema = z.object({
  email: z.string().min(1).max(255).transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1).max(256),
});

const ADMIN_HOST = 'admin.mdijital.io';

function isAllowedAdminHost(host: string): boolean {
  return host.includes(ADMIN_HOST) ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1');
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const xForwardedHost = headersList.get('x-forwarded-host');
    const hostHeader = headersList.get('host') || '';
    const host = (xForwardedHost ?? hostHeader).split(',')[0].trim();
    
    if (!isAllowedAdminHost(host)) {
      logSecurityEvent('ADMIN_LOGIN_WRONG_HOST', {
        host,
        message: 'Admin login only allowed via admin.mdijital.io or localhost',
      });
      return NextResponse.json(
        { error: 'ADMIN_LOGIN_ONLY_VIA_SUBDOMAIN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    const { email: sanitizedEmail, password } = parsed.data;

    const ipAddress = getClientIp(headersList);
    const windowMs = 30 * 60 * 1000;
    const rateLimitKey = `admin_login:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 20, windowMs);

    if (!rateLimit.allowed) {
      logSecurityEvent('ADMIN_LOGIN_RATE_LIMIT', {
        ip: ipAddress,
        email: sanitizedEmail,
        message: 'Too many admin login attempts',
      });
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'TOO_MANY_ATTEMPTS', retryAfterSeconds: retryAfter },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } }
      );
    }

    // Verify admin credentials manually
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: { 
        id: true, 
        email: true,
        name: true,
        role: true, 
        isActive: true, 
        emailVerified: true,
        password: true
      },
    });

    if (!user || user.role !== 'ADMIN') {
      logSecurityEvent('ADMIN_LOGIN_FAILED', {
        ip: ipAddress,
        email: sanitizedEmail,
        message: 'Non-admin user attempted admin login',
      });
      
      return NextResponse.json(
        { error: 'NOT_ADMIN' },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      logSecurityEvent('ADMIN_LOGIN_FAILED', {
        ip: ipAddress,
        email: sanitizedEmail,
        message: 'Inactive admin account login attempt',
      });
      
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logSecurityEvent('ADMIN_LOGIN_FAILED', {
        ip: ipAddress,
        email: sanitizedEmail,
        message: 'Invalid admin credentials',
      });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Credentials are valid, return success
    // The actual session creation will be handled by the client calling NextAuth
    logSecurityEvent('ADMIN_LOGIN_SUCCESS', {
      ip: ipAddress,
      email: sanitizedEmail,
      message: 'Admin credentials verified successfully',
    });

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('ADMIN LOGIN ERROR:', error);
    logApiError('/api/auth/admin/login', error);
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}