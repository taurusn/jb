import { NextRequest } from 'next/server';
import {
  handleGetPlatformSettings,
  handleUpdatePlatformSettings,
} from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/settings
 * Get platform settings
 */
export async function GET(request: NextRequest) {
  return handleGetPlatformSettings(request);
}

/**
 * PATCH /api/adminofjb/settings
 * Update platform settings
 */
export async function PATCH(request: NextRequest) {
  return handleUpdatePlatformSettings(request);
}
