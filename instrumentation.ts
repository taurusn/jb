/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts
 * Perfect for initializing background tasks
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on Node.js runtime (not Edge)
    const { startBackgroundTasks } = await import('./lib/background-tasks');
    startBackgroundTasks();
  }
}
