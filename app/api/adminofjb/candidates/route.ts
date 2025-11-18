import { NextRequest } from 'next/server';
import { handleGetAllCandidates } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/candidates
 * Get all candidates with filters
 */
export async function GET(request: NextRequest) {
  return handleGetAllCandidates(request);
}
