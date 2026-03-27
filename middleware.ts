import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_HOST = 'admin.mdijital.io';

const ADMIN_ROOT_SEGMENTS = ['users', 'requests', 'contacts', 'blog', 'careers', 'applications', 'newsletter', 'email', 'settings', 'panel'];

function isAdminHost(hostname: string): boolean {
  return hostname.startsWith(ADMIN_HOST);
}

function isLocalhostAdminPath(hostname: string, pathname: string): boolean {
  return (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) && 
         (pathname === '/admin' || pathname.startsWith('/admin/') ||
          pathname === '/tr/admin' || pathname.startsWith('/tr/admin/') ||
          pathname === '/en/admin' || pathname.startsWith('/en/admin'));
}

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/tr/admin' || pathname.startsWith('/tr/admin/') ||
    pathname === '/en/admin' || pathname.startsWith('/en/admin');
}

function isAdminRootPath(pathname: string): boolean {
  if (pathname === '/') return true;
  const seg = pathname.split('/')[1];
  return seg ? ADMIN_ROOT_SEGMENTS.includes(seg) : false;
}

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Handle admin.mdijital.io (production admin host)
  if (isAdminHost(hostname)) {
    // Redirect customer auth paths to admin root
    if (pathname === '/auth/login' || pathname === '/tr/auth/login' || pathname === '/en/auth/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Redirect admin paths to root on production admin host
    if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/admin/')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(/^\/admin/, '') || '/';
      return NextResponse.redirect(url);
    }
    if (pathname === '/en/admin' || pathname.startsWith('/en/admin/') ||
        pathname === '/tr/admin' || pathname.startsWith('/tr/admin/')) {
      const url = request.nextUrl.clone();
      const withoutLocale = pathname.replace(/^\/(en|tr)/, '');
      url.pathname = withoutLocale.replace(/^\/admin/, '') || '/';
      return NextResponse.redirect(url);
    }

    // Rewrite /panel to dashboard on production admin host
    if (pathname === '/panel' || pathname === '/panel/') {
      requestHeaders.set('x-pathname', '/');
      requestHeaders.set('x-admin-route', 'true');
      const rewritePath = '/en/admin';
      const rewriteUrl = new URL(rewritePath, request.url);
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    // Rewrite root and locales to admin on production admin host
    if (pathname === '/' || pathname === '/tr' || pathname === '/en') {
      requestHeaders.set('x-pathname', '/');
      requestHeaders.set('x-admin-route', 'true');
      const rewritePath = '/en/admin';
      const rewriteUrl = new URL(rewritePath, request.url);
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    // Rewrite admin root paths to admin on production admin host
    if (isAdminRootPath(pathname)) {
      requestHeaders.set('x-pathname', pathname);
      requestHeaders.set('x-admin-route', 'true');
      const rewritePath = '/en/admin' + (pathname === '/' ? '' : pathname);
      const rewriteUrl = new URL(rewritePath, request.url);
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    const requestWithPath = new NextRequest(request.url, { headers: requestHeaders });
    return intlMiddleware(requestWithPath);
  }

  // Handle localhost admin paths
  if (isLocalhostAdminPath(hostname, pathname)) {
    // Redirect customer auth paths to admin
    if (pathname === '/auth/login' || pathname === '/tr/auth/login' || pathname === '/en/auth/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    requestHeaders.set('x-pathname', pathname);
    requestHeaders.set('x-admin-route', 'true');
    const rewritePath = (pathname.startsWith('/en') || pathname.startsWith('/tr')) ? pathname : '/en' + pathname;
    const rewriteUrl = new URL(rewritePath, request.url);
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  }

  // Handle non-localhost admin paths (redirect to production admin host)
  if (isAdminPath(pathname) && !hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1')) {
    const url = new URL(request.url);
    url.host = ADMIN_HOST;
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Regular routing for non-admin paths
  const requestWithPath = new NextRequest(request.url, { headers: requestHeaders });
  return intlMiddleware(requestWithPath);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

