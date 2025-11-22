import { NextRequest } from 'next/server';
import { handleGetInterviewById } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/interviews/[id]
 * Get interview details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetInterviewById(request, id);
}
