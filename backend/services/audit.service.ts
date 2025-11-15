import { prisma as db } from '@/lib/db';

/**
 * Audit Service
 * Handles logging of all admin actions for accountability and security
 */

export interface CreateAuditLogData {
  adminId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export type AuditAction =
  | 'DELETE_CANDIDATE'
  | 'DELETE_EMPLOYER'
  | 'DELETE_REQUEST'
  | 'UPDATE_REQUEST_STATUS'
  | 'ADD_ADMIN_NOTE'
  | 'UPDATE_SETTINGS'
  | 'LOGIN'
  | 'LOGOUT';

export type EntityType = 'CANDIDATE' | 'EMPLOYER' | 'REQUEST' | 'SETTINGS' | 'AUTH';

export interface AuditLogFilters {
  adminId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Create a new audit log entry
 */
export async function createAuditLog(data: CreateAuditLogData) {
  try {
    const auditLog = await db.auditLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress || null,
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw new Error('Failed to create audit log');
  }
}

/**
 * Get audit logs with filters and pagination
 */
export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const {
    adminId,
    action,
    entityType,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};

  if (adminId) where.adminId = adminId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }

  try {
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    // Parse JSON details
    const logsWithParsedDetails = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return {
      logs: logsWithParsedDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }
}

/**
 * Get recent audit logs (for dashboard activity feed)
 */
export async function getRecentAuditLogs(limit: number = 10) {
  try {
    const logs = await db.auditLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Parse JSON details
    const logsWithParsedDetails = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return logsWithParsedDetails;
  } catch (error) {
    console.error('Error fetching recent audit logs:', error);
    throw new Error('Failed to fetch recent audit logs');
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsByEntity(
  entityType: EntityType,
  entityId: string
) {
  try {
    const logs = await db.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON details
    const logsWithParsedDetails = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return logsWithParsedDetails;
  } catch (error) {
    console.error('Error fetching audit logs by entity:', error);
    throw new Error('Failed to fetch audit logs by entity');
  }
}

/**
 * Delete old audit logs (for cleanup/maintenance)
 * Useful for keeping database size manageable
 */
export async function deleteOldAuditLogs(olderThanDays: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  try {
    const result = await db.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return {
      deleted: result.count,
      cutoffDate,
    };
  } catch (error) {
    console.error('Error deleting old audit logs:', error);
    throw new Error('Failed to delete old audit logs');
  }
}
