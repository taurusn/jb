import { cleanupExpiredMeetings } from './cleanup-expired-meetings';

/**
 * Background tasks runner - starts automatically when the server starts
 * Runs cleanup tasks at regular intervals without needing external cron
 */

let cleanupInterval: NodeJS.Timeout | null = null;

export function startBackgroundTasks() {
  // Prevent multiple instances
  if (cleanupInterval) {
    console.log('[Background Tasks] Already running');
    return;
  }

  console.log('[Background Tasks] Starting background tasks...');

  // Run cleanup every week (7 days)
  const CLEANUP_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Run immediately on startup
  cleanupExpiredMeetings().then((result) => {
    console.log('[Background Tasks] Initial cleanup result:', result);
  });

  // Then run every week
  cleanupInterval = setInterval(async () => {
    console.log('[Background Tasks] Running scheduled cleanup...');
    const result = await cleanupExpiredMeetings();
    console.log('[Background Tasks] Cleanup result:', result);
  }, CLEANUP_INTERVAL);

  console.log('[Background Tasks] Cleanup task scheduled to run every week');
}

export function stopBackgroundTasks() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Background Tasks] Background tasks stopped');
  }
}

// Auto-start in production/development
if (typeof window === 'undefined') {
  // Only run on server-side
  startBackgroundTasks();
}
