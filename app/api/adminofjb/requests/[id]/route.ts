import { NextRequest } from 'next/server';
import {
  handleGetRequestById,
  handleUpdateRequest,
  handleDeleteRequest,
} from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/requests/[id]
 * Get request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetRequestById(request, id);
}

/**
 * PATCH /api/adminofjb/requests/[id]
 * Update request (status or add note)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateRequest(request, id);
}

/**
 * DELETE /api/adminofjb/requests/[id]
 * Delete request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDeleteRequest(request, id);
}
