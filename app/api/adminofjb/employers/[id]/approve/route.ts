import { NextRequest, NextResponse } from 'next/server';
import { approveEmployer } from '@/backend/services/admin.service';

/**
 * POST /api/adminofjb/employers/[id]/approve
 * Approve a pending employer application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = request.headers.get('x-user-id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: employerId } = await params;

    const employer = await approveEmployer(employerId, adminId);

    return NextResponse.json({
      success: true,
      message: 'Employer approved successfully',
      employer,
    });
  } catch (error) {
    console.error('Approve employer API error:', error);
    return NextResponse.json(
      { error: 'Failed to approve employer' },
      { status: 500 }
    );
  }
}
