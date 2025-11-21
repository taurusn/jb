import { NextRequest, NextResponse } from 'next/server';
import { getPendingEmployers } from '@/backend/services/admin.service';

/**
 * GET /api/adminofjb/employers/pending
 * Get all pending employers awaiting approval
 */
export async function GET(request: NextRequest) {
  try {
    // User is already verified as ADMIN by middleware
    const adminId = request.headers.get('x-user-id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pendingEmployers = await getPendingEmployers();

    return NextResponse.json({
      success: true,
      employers: pendingEmployers,
    });
  } catch (error) {
    console.error('Get pending employers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending employers' },
      { status: 500 }
    );
  }
}
