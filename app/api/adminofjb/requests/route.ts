import { NextRequest } from 'next/server';
import { handleGetAllRequests } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/requests
 * Get all requests with filters
 */
export async function GET(request: NextRequest) {
  return handleGetAllRequests(request);
}
