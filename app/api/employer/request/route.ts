import { NextRequest, NextResponse } from 'next/server';
import { handleCreateEmployeeRequest, handleGetEmployerRequests } from '@/backend/controllers/employer.controller';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';

/**
 * @openapi
 * /api/employer/request:
 *   post:
 *     tags:
 *       - Employer
 *     summary: Request an employee
 *     description: Create a request for a specific employee (employer demands employee)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Validation error or duplicate request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Add employer ID to request data
    const requestData = {
      ...body,
      employerId: employerProfile.id,
    };

    // Create request
    const result = await handleCreateEmployeeRequest(requestData);

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
        message: result.message || 'Request created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create employee request API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/employer/request:
 *   get:
 *     tags:
 *       - Employer
 *     summary: Get employer's requests
 *     description: Get all requests made by the authenticated employer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
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

    // Get requests
    const result = await handleGetEmployerRequests(employerProfile.id);

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
    console.error('Get employer requests API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
