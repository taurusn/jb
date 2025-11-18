import { prisma } from '@/lib/db';

/**
 * Clean up expired meeting links from the database
 *
 * This function should be called periodically (e.g., via a cron job)
 * to remove meeting links and details for interviews that have ended.
 *
 * Usage:
 * - As a cron job: Run this script every hour or every 30 minutes
 * - With Vercel: Use Vercel Cron Jobs (vercel.json config)
 * - With other platforms: Use their scheduled tasks feature
 * - Locally for testing: node -r ts-node/register lib/cleanup-expired-meetings.ts
 */
export async function cleanupExpiredMeetings() {
  try {
    console.log('[Cleanup] Starting expired meetings cleanup...');

    const now = new Date();

    // Find all requests with expired meetings
    const expiredRequests = await prisma.employeeRequest.findMany({
      where: {
        meetingEndsAt: {
          lte: now, // Less than or equal to now (meeting has ended)
        },
        meetingLink: {
          not: null, // Only cleanup if there's a meeting link
        },
      },
      select: {
        id: true,
        meetingDate: true,
        meetingEndsAt: true,
        employee: {
          select: {
            fullName: true,
          },
        },
        employer: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (expiredRequests.length === 0) {
      console.log('[Cleanup] No expired meetings found.');
      return {
        success: true,
        count: 0,
        message: 'No expired meetings to cleanup',
      };
    }

    console.log(`[Cleanup] Found ${expiredRequests.length} expired meeting(s)`);

    // Update all expired requests to remove meeting details
    const result = await prisma.employeeRequest.updateMany({
      where: {
        meetingEndsAt: {
          lte: now,
        },
        meetingLink: {
          not: null,
        },
      },
      data: {
        meetingLink: null,
        // Note: We keep meetingDate, meetingDuration, and meetingEndsAt for historical records
        // If you want to delete these too, uncomment the lines below:
        // meetingDate: null,
        // meetingDuration: null,
        // meetingEndsAt: null,
      },
    });

    console.log(`[Cleanup] Successfully cleaned up ${result.count} expired meeting link(s)`);

    // Log details of cleaned meetings
    expiredRequests.forEach((request) => {
      console.log(
        `  - Cleaned: ${request.employee.fullName} / ${request.employer.companyName} ` +
        `(ended at ${request.meetingEndsAt?.toISOString()})`
      );
    });

    return {
      success: true,
      count: result.count,
      message: `Cleaned up ${result.count} expired meeting link(s)`,
      details: expiredRequests.map((r) => ({
        id: r.id,
        candidate: r.employee.fullName,
        employer: r.employer.companyName,
        endedAt: r.meetingEndsAt,
      })),
    };
  } catch (error) {
    console.error('[Cleanup] Error cleaning up expired meetings:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run cleanup if this script is executed directly
 *
 * Usage: npx tsx lib/cleanup-expired-meetings.ts
 */
if (require.main === module) {
  cleanupExpiredMeetings()
    .then((result) => {
      console.log('\n[Cleanup] Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n[Cleanup] Fatal error:', error);
      process.exit(1);
    });
}
