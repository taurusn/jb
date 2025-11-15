import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';

/**
 * Middleware to protect routes
 *
 * Protected routes:
 * - /employer/* - Only accessible to authenticated employers
 * - /api/employer/* - Only accessible to authenticated employers
 * - /adminofjb/* - Only accessible to authenticated admins
 * - /api/adminofjb/* - Only accessible to authenticated admins
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', pathname);
  console.log('Cookies:', request.cookies.getAll());

  // Exclude login pages from authentication
  const isLoginPage = pathname === '/login' || pathname === '/adminofjb/login';
  if (isLoginPage) {
    console.log('Login page - no auth required');
    return NextResponse.next();
  }

  // Check if route needs protection
  const isEmployerRoute = pathname.startsWith('/employer');
  const isEmployerApiRoute = pathname.startsWith('/api/employer');
  const isAdminRoute = pathname.startsWith('/adminofjb');
  const isAdminApiRoute = pathname.startsWith('/api/adminofjb');

  const requiresAuth = isEmployerRoute || isEmployerApiRoute || isAdminRoute || isAdminApiRoute;

  console.log('Requires auth:', requiresAuth);
  console.log('Is admin route:', isAdminRoute || isAdminApiRoute);

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
    if (isEmployerApiRoute || isAdminApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Redirect to appropriate login page
    const loginUrl = isAdminRoute
      ? new URL('/adminofjb/login', request.url)
      : new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const decoded = await verifyTokenEdge(token);

  console.log('Token decoded:', !!decoded);
  console.log('User:', decoded);

  if (!decoded) {
    // Invalid token
    if (isEmployerApiRoute || isAdminApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const loginUrl = isAdminRoute
      ? new URL('/adminofjb/login', request.url)
      : new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (isAdminRoute || isAdminApiRoute) {
    // Admin routes require ADMIN role only
    if (decoded.role !== 'ADMIN') {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else if (isEmployerRoute || isEmployerApiRoute) {
    // Employer routes require EMPLOYER role (admins can also access)
    if (decoded.role !== 'EMPLOYER' && decoded.role !== 'ADMIN') {
      if (isEmployerApiRoute) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
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
    '/adminofjb/:path*',
    '/api/adminofjb/:path*',
  ],
};
