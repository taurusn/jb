import { NextRequest, NextResponse } from 'next/server';
import { handleRegister } from '@/backend/controllers/auth.controller';
import { prisma as db } from '@/lib/db';

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new employer
 *     description: Create a new employer account with company profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - companyName
 *               - contactPerson
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *               companyName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               companyWebsite:
 *                 type: string
 *                 format: uri
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error or email already exists
 *       403:
 *         description: Registrations are currently closed
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check if registrations are allowed
    const settings = await db.platformSettings.findFirst({
      where: { id: 'default' },
      select: { allowNewRegistrations: true },
    });

    if (settings && settings.allowNewRegistrations === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'New employer registrations are currently closed. Please check back later.'
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const result = await handleRegister(body);

    if (!result.success) {
      // Determine appropriate status code based on error type
      let statusCode = 400;
      if (result.error?.includes('already registered')) {
        statusCode = 409; // Conflict
      } else if (result.error?.includes('email domain')) {
        statusCode = 422; // Unprocessable Entity
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
      );
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: result.data.user,
        },
        message: result.message || 'Registration successful',
      },
      { status: 201 }
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
    console.error('Register API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
}
