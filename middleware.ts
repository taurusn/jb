import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';

/**
 * Middleware to protect routes
 * 
 * Protected routes:
 * - /employer/* - Only accessible to authenticated employers
 * - /api/employer/* - Only accessible to authenticated employers
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', pathname);
  console.log('Cookies:', request.cookies.getAll());

  // Check if route needs protection
  const isEmployerRoute = pathname.startsWith('/employer');
  const isEmployerApiRoute = pathname.startsWith('/api/employer');
  
  const requiresAuth = isEmployerRoute || isEmployerApiRoute;

  console.log('Requires auth:', requiresAuth);

  if (!requiresAuth) {
    console.log('No auth required, passing through');
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  console.log('Token found:', !!token);
  console.log('Token value (first 20 chars):', token?.substring(0, 20));

  // If no token, redirect to login (for pages) or return 401 (for API)
  if (!token) {
    console.log('No token - redirecting to login');
    if (isEmployerApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const decoded = await verifyTokenEdge(token);

  console.log('Token decoded:', !!decoded);
  console.log('User:', decoded);

  if (!decoded) {
    // Invalid token
    if (isEmployerApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has employer role
  if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') {
    if (isEmployerApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', decoded.userId);
  requestHeaders.set('x-user-email', decoded.email);
  requestHeaders.set('x-user-role', decoded.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware configuration
 * Define which routes should run through middleware
 */
export const config = {
  matcher: [
    '/employer/:path*',
    '/api/employer/:path*',
  ],
};
