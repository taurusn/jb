import { NextRequest } from 'next/server';
import {
  handleGetEmployerById,
  handleDeleteEmployer,
} from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/employers/[id]
 * Get employer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetEmployerById(request, id);
}

/**
 * DELETE /api/adminofjb/employers/[id]
 * Delete employer (cascades to profile and requests)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteEmployer(request, id);
}
