import { NextResponse } from 'next/server';
import { handleGetEmployerStats } from '@/backend/controllers/employer.controller';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';

/**
 * @openapi
 * /api/employer/stats:
 *   get:
 *     tags:
 *       - Employer
 *     summary: Get employer statistics
 *     description: Get statistics about employer's requests (total, pending, approved, rejected)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get employer profile
    const employerProfile = await getEmployerProfile(user.userId);
    if (!employerProfile) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    // Get stats
    const result = await handleGetEmployerStats(employerProfile.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get employer stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
