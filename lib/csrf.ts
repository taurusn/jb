/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Custom implementation for Next.js 16
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_COOKIE_NAME = '__Host-csrf-token';
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a secure random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Get or create CSRF token from cookies (server-side)
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return token;
}

/**
 * Verify CSRF token from request headers
 */
export async function verifyCsrfToken(request: NextRequest): Promise<boolean> {
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

/**
 * Middleware to enforce CSRF protection on state-changing methods
 */
export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // Only protect state-changing methods
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!protectedMethods.includes(method)) {
    return null; // Allow GET, HEAD, OPTIONS
  }

  // Skip CSRF check for these endpoints (they use other auth mechanisms)
  const skipPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
  ];

  if (skipPaths.some(path => pathname.startsWith(path))) {
    return null; // Skip CSRF check
  }

  // Verify CSRF token
  const isValid = await verifyCsrfToken(request);

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: 'CSRF token validation failed',
        code: 'CSRF_INVALID'
      },
      { status: 403 }
    );
  }

  return null; // CSRF check passed
}

/**
 * API route to get CSRF token (for client-side use)
 */
export async function getCsrfTokenResponse() {
  const token = await getCsrfToken();

  return NextResponse.json(
    { token },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
