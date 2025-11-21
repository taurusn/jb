/**
 * CSRF Protection for Edge Runtime (Middleware)
 * Compatible with Next.js Edge Runtime
 */

import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_COOKIE_NAME = '__Host-csrf-token';
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a secure random CSRF token (Edge-compatible)
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify CSRF token from request
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison
  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Ensure CSRF token exists in request (create if needed)
 */
export function ensureCsrfToken(request: NextRequest, response: NextResponse): NextResponse {
  const existingToken = request.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value;

  if (!existingToken) {
    const newToken = generateCsrfToken();
    response.cookies.set(CSRF_TOKEN_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}

/**
 * CSRF Middleware for Edge Runtime
 * Protects state-changing HTTP methods
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // Only protect state-changing methods
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!protectedMethods.includes(method)) {
    return null; // Allow GET, HEAD, OPTIONS
  }

  // Skip CSRF check for auth endpoints (they use other mechanisms)
  const skipPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/csrf', // CSRF token endpoint itself
  ];

  if (skipPaths.some(path => pathname.startsWith(path))) {
    return null; // Skip CSRF check
  }

  // Verify CSRF token
  const isValid = verifyCsrfToken(request);

  if (!isValid) {
    console.warn(`⚠️  CSRF validation failed for ${method} ${pathname}`);
    return NextResponse.json(
      {
        success: false,
        error: 'CSRF token validation failed. Please refresh the page and try again.',
        code: 'CSRF_INVALID'
      },
      { status: 403 }
    );
  }

  return null; // CSRF check passed
}
