import { NextRequest } from 'next/server';
import { handleGetDashboardStats } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/stats
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  return handleGetDashboardStats(request);
}
