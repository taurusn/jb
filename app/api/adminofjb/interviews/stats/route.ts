import { NextRequest } from 'next/server';
import { handleGetInterviewStats } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/interviews/stats
 * Get interview statistics
 */
export async function GET(request: NextRequest) {
  return handleGetInterviewStats(request);
}
