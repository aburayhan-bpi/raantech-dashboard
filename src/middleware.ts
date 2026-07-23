import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Decode JWT payload (Edge compatible)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      const role = payload.role as string; // 'SUPER_ADMIN', 'ADMIN', 'STAFF'
      const rolePath = role.toLowerCase().replace('_', '-');
      const allowedPrefix = `/dashboard/${rolePath}`;

      // Cross-role protection
      // If trying to access another role's dashboard directly, redirect to their own
      if (!pathname.startsWith(allowedPrefix) && pathname !== '/dashboard') {
        return NextResponse.redirect(new URL(allowedPrefix, request.url));
      }

      // Root /dashboard goes to their specific role dashboard
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL(allowedPrefix, request.url));
      }
    } catch {
      // If token is invalid/tampered, clear it and force login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect root to dashboard or login
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
