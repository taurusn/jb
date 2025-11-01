import { NextResponse } from 'next/server';
import { removeTokenFromCookies } from '@/lib/auth';

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout employer
 *     description: Clear authentication token and logout user
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
export async function POST() {
  try {
    // Remove token from cookies
    await removeTokenFromCookies();

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
