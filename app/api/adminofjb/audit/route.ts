import { NextRequest } from 'next/server';
import { handleGetAuditLogs } from '@/backend/controllers/admin.controller';

/**
 * GET /api/adminofjb/audit
 * Get audit logs with filters
 */
export async function GET(request: NextRequest) {
  return handleGetAuditLogs(request);
}
