import { NextRequest, NextResponse } from 'next/server';
import { handleGetRequestedEmployees } from '@/backend/controllers/employee.controller';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';

/**
 * @openapi
 * /api/employer/applicants/requested:
 *   get:
 *     tags:
 *       - Employer
 *     summary: Get all requested applicants
 *     description: Get paginated list of job applicants that have been requested by this employer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: city
 *         in: query
 *         schema:
 *           type: string
 *       - name: education
 *         in: query
 *         schema:
 *           type: string
 *       - name: skills
 *         in: query
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of requested applicants with status
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);

    // Parse skills from comma-separated string to array
    const skillsParam = searchParams.get('skills');
    const skillsArray = skillsParam
      ? skillsParam.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const query = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      city: searchParams.get('city') || undefined,
      education: searchParams.get('education') || undefined,
      skills: skillsArray,
      experience: searchParams.get('experience') || undefined,
      search: searchParams.get('search') || undefined,
      skillMatchMode: (searchParams.get('skillMatchMode') as 'any' | 'all') || undefined,
    };

    console.log('Requested applicants query params:', query);

    // Get employer profile to get employer ID
    const employerProfile = await getEmployerProfile(user.userId);
    if (!employerProfile) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    // Get requested applicants only
    const result = await handleGetRequestedEmployees(employerProfile.id, query);

    console.log('Requested applicants result:', result);

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
    console.error('Get requested applicants API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}