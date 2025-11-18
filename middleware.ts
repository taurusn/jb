import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, getPlatformSettingsEdge } from '@/lib/auth-edge';

/**
 * Middleware to protect routes and enforce platform settings
 *
 * Protected routes:
 * - /employer/* - Only accessible to authenticated employers (dashboard)
 * - /api/employer/* - Only accessible to authenticated employers
 * - /adminofjb/* - Only accessible to authenticated admins
 * - /api/adminofjb/* - Only accessible to authenticated admins
 *
 * Public routes:
 * - /employers - Public employer landing page (no authentication required)
 * - / - Public job seeker application page
 *
 * Platform settings enforcement:
 * - Maintenance mode redirects non-admin users to /maintenance
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', pathname);
  console.log('Cookies:', request.cookies.getAll());

  // Exclude login and maintenance pages from special handling
  const isLoginPage = pathname === '/login' || pathname === '/adminofjb/login';
  const isMaintenancePage = pathname === '/maintenance';
  const isPublicSettingsApi = pathname === '/api/settings/public';

  // Check if route needs protection
  const isEmployerRoute = pathname.startsWith('/employer/');
  const isEmployerApiRoute = pathname.startsWith('/api/employer');
  const isAdminRoute = pathname.startsWith('/adminofjb');
  const isAdminApiRoute = pathname.startsWith('/api/adminofjb');

  const requiresAuth = isEmployerRoute || isEmployerApiRoute || isAdminRoute || isAdminApiRoute;

  console.log('Requires auth:', requiresAuth);
  console.log('Is admin route:', isAdminRoute || isAdminApiRoute);

  // Allow public settings API FIRST (prevent infinite loop)
  if (isPublicSettingsApi) {
    console.log('Public settings API - no auth required, skipping');
    return NextResponse.next();
  }

  // Allow login pages
  if (isLoginPage) {
    console.log('Login page - no auth required');
    return NextResponse.next();
  }

  // Allow maintenance page access
  if (isMaintenancePage) {
    console.log('Maintenance page - allowing access');
    return NextResponse.next();
  }

  // Get platform settings (AFTER checking for settings API to prevent infinite loop)
  const settings = await getPlatformSettingsEdge();
  console.log('Platform settings:', settings);

  // Get token to check if user is admin (before enforcing maintenance mode)
  const token = request.cookies.get('token')?.value;
  let isAdmin = false;

  if (token) {
    const decoded = await verifyTokenEdge(token);
    isAdmin = decoded?.role === 'ADMIN';
  }

  // Enforce maintenance mode for non-admin users
  if (settings.maintenanceMode && !isAdmin) {
    console.log('Maintenance mode active - redirecting to /maintenance');
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  if (!requiresAuth) {
    console.log('No auth required, passing through');
    return NextResponse.next();
  }

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
    // Protected routes
    '/employer/:path*',
    '/api/employer/:path*',
    '/adminofjb/:path*',
    '/api/adminofjb/:path*',
    // Public routes that need settings checks (maintenance mode)
    '/',
    '/login',
    '/maintenance',
    '/api/settings/public',
    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
