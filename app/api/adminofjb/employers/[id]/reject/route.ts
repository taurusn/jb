import { NextRequest, NextResponse } from 'next/server';
import { rejectEmployer } from '@/backend/services/admin.service';

/**
 * POST /api/adminofjb/employers/[id]/reject
 * Reject a pending employer application
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
    const body = await request.json();
    const { reason } = body;

    const employer = await rejectEmployer(employerId, adminId, reason);

    return NextResponse.json({
      success: true,
      message: 'Employer rejected successfully',
      employer,
    });
  } catch (error) {
    console.error('Reject employer API error:', error);
    return NextResponse.json(
      { error: 'Failed to reject employer' },
      { status: 500 }
    );
  }
}
