import { NextRequest } from 'next/server';
import {
  handleGetCandidateById,
  handleDeleteCandidate,
} from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/candidates/[id]
 * Get candidate by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetCandidateById(request, id);
}

/**
 * DELETE /api/adminofjb/candidates/[id]
 * Delete candidate (cascades to all requests)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteCandidate(request, id);
}
