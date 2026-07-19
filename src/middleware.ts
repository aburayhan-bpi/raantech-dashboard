import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Using a simple check for Edge runtime since we can't use full jsonwebtoken verify easily in Edge
// Actually Next.js middleware runs on Edge runtime where jsonwebtoken doesn't work well due to crypto dependencies.
// Since this is an MVP, we will just check if the cookie exists. The API routes will do the actual JWT verification.
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to login if no token
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
