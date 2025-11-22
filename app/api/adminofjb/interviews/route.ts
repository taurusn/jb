import { NextRequest } from 'next/server';
import { handleGetInterviews } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/interviews
 * Get all interviews with filters
 */
export async function GET(request: NextRequest) {
  return handleGetInterviews(request);
}
