import { getCsrfTokenResponse } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Returns CSRF token for client-side use
 */
export async function GET() {
  return getCsrfTokenResponse();
}
