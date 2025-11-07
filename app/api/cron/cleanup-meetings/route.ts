import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredMeetings } from '@/lib/cleanup-expired-meetings';

/**
 * @openapi
 * /api/cron/cleanup-meetings:
 *   get:
 *     tags:
 *       - Cron Jobs
 *     summary: Cleanup expired meeting links
 *     description: |
 *       Removes meeting links from database for interviews that have ended.
 *       This endpoint should be called periodically by a cron job service.
 *
 *       **Security**: Protected by CRON_SECRET environment variable.
 *
 *       **Setup for Vercel Cron Jobs**:
 *       Add to vercel.json:
 *       ```json
 *       {
 *         "crons": [{
 *           "path": "/api/cron/cleanup-meetings",
 *           "schedule": "0 * * * *"
 *         }]
 *       }
 *       ```
 *
 *       **Schedule format (cron syntax)**:
 *       - `0 * * * *` - Every hour at minute 0
 *       - `*/30 * * * *` - Every 30 minutes
 *       - `0 0 * * *` - Every day at midnight
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token matching CRON_SECRET env variable
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *       401:
 *         description: Unauthorized (invalid or missing CRON_SECRET)
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret) {
      const token = authHeader?.replace('Bearer ', '');

      if (!token || token !== cronSecret) {
        console.log('[Cron] Unauthorized cleanup attempt');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      console.warn('[Cron] Warning: CRON_SECRET not set. This endpoint is unprotected!');
    }

    // Run the cleanup
    const result = await cleanupExpiredMeetings();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: result.count,
        message: result.message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron] Cleanup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
