import { NextRequest, NextResponse } from 'next/server';
import { handleLogin } from '@/backend/controllers/auth.controller';
import { checkRateLimit, rateLimitConfigs, getClientIdentifier } from '@/lib/rate-limit';

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login employer
 *     description: Authenticate employer and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per 15 minutes
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`login:${identifier}`, rateLimitConfigs.login);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
          },
        }
      );
    }

    const body = await request.json();
    
    const result = await handleLogin(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: result.data.user,
        },
        message: result.message || 'Login successful',
      },
      { status: 200 }
    );

    // Set token in httpOnly cookie on the response
    response.cookies.set('token', result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
