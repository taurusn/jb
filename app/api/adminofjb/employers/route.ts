import { NextRequest } from 'next/server';
import { handleGetAllEmployers } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/employers
 * Get all employers with filters
 */
export async function GET(request: NextRequest) {
  return handleGetAllEmployers(request);
}
