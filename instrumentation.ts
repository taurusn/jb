/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts
 * Perfect for initializing background tasks and security validation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on Node.js runtime (not Edge)

    // CRITICAL: Validate environment variables before anything else
    const { validateEnvironmentOrExit } = await import('./lib/validate-env');
    validateEnvironmentOrExit();

    // Start background tasks after validation passes
    const { startBackgroundTasks } = await import('./lib/background-tasks');
    startBackgroundTasks();
  }
}
