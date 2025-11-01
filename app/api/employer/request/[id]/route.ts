import { NextRequest, NextResponse } from 'next/server';
import { handleUpdateRequestStatus } from '@/backend/controllers/employer.controller';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';

/**
 * @openapi
 * /api/employer/request/{id}:
 *   put:
 *     tags:
 *       - Employer
 *     summary: Update employee request status
 *     description: Update the status of an employee request (approve/reject)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this request
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const requestId = resolvedParams.id;
    const body = await request.json();

    // Update the request status
    const result = await handleUpdateRequestStatus(requestId, employerProfile.id, body);

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
        message: result.message || 'Request status updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update request status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}