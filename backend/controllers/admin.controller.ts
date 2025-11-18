import { NextRequest, NextResponse } from 'next/server';
import * as adminService from '@/backend/services/admin.service';
import * as auditService from '@/backend/services/audit.service';
import { EmployeeRequestStatus } from '@prisma/client';

/**
 * Admin Controller
 * Thin layer that handles HTTP requests and calls admin service functions
 */

// Helper to extract admin info from request headers
export function getAdminFromHeaders(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');

  if (!userId || !email || role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin access required');
  }

  return { userId, email, role };
}

// Helper to get IP address
export function getIpAddress(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

export async function handleGetDashboardStats(request: NextRequest) {
  try {
    getAdminFromHeaders(request); // Verify admin access

    const stats = await adminService.getDashboardStats();

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetDashboardStats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

// ============================================
// REQUESTS MANAGEMENT
// ============================================

export async function handleGetAllRequests(request: NextRequest) {
  try {
    getAdminFromHeaders(request);

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') as EmployeeRequestStatus | undefined,
      search: searchParams.get('search') || undefined,
      fromDate: searchParams.get('fromDate')
        ? new Date(searchParams.get('fromDate')!)
        : undefined,
      toDate: searchParams.get('toDate')
        ? new Date(searchParams.get('toDate')!)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : undefined,
    };

    const result = await adminService.getAllRequests(filters);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetAllRequests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function handleGetRequestById(
  request: NextRequest,
  id: string
) {
  try {
    getAdminFromHeaders(request);

    const result = await adminService.getRequestById(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetRequestById:', error);
    const status = error instanceof Error && error.message === 'Request not found' ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch request' },
      { status }
    );
  }
}

export async function handleUpdateRequest(request: NextRequest, id: string) {
  try {
    const admin = getAdminFromHeaders(request);
    const ipAddress = getIpAddress(request);
    const body = await request.json();

    // Get current request state for audit log
    const currentRequest = await adminService.getRequestById(id);

    // Handle status update
    if (body.status) {
      const updatedRequest = await adminService.updateRequestStatus(
        id,
        body.status
      );

      // Create audit log
      await auditService.createAuditLog({
        adminId: admin.userId,
        action: 'UPDATE_REQUEST_STATUS',
        entityType: 'REQUEST',
        entityId: id,
        details: {
          previousStatus: currentRequest.status,
          newStatus: body.status,
          candidateName: updatedRequest.employee.fullName,
          employerCompany: updatedRequest.employer.companyName,
        },
        ipAddress,
      });

      return NextResponse.json(updatedRequest, { status: 200 });
    }

    // Handle admin note addition
    if (body.note) {
      const updatedRequest = await adminService.addAdminNote(
        id,
        body.note,
        admin.email
      );

      // Create audit log
      await auditService.createAuditLog({
        adminId: admin.userId,
        action: 'ADD_ADMIN_NOTE',
        entityType: 'REQUEST',
        entityId: id,
        details: {
          note: body.note,
          candidateName: updatedRequest.employee.fullName,
          employerCompany: updatedRequest.employer.companyName,
        },
        ipAddress,
      });

      return NextResponse.json(updatedRequest, { status: 200 });
    }

    return NextResponse.json(
      { error: 'No valid update data provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in handleUpdateRequest:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function handleDeleteRequest(request: NextRequest, id: string) {
  try {
    const admin = getAdminFromHeaders(request);
    const ipAddress = getIpAddress(request);

    const deletedRequest = await adminService.deleteRequest(id);

    // Create audit log
    await auditService.createAuditLog({
      adminId: admin.userId,
      action: 'DELETE_REQUEST',
      entityType: 'REQUEST',
      entityId: id,
      details: {
        candidateName: deletedRequest.employee.fullName,
        employerCompany: deletedRequest.employer.companyName,
        status: deletedRequest.status,
      },
      ipAddress,
    });

    return NextResponse.json(
      { message: 'Request deleted successfully', request: deletedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in handleDeleteRequest:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete request' },
      { status: 500 }
    );
  }
}

// ============================================
// CANDIDATES MANAGEMENT
// ============================================

export async function handleGetAllCandidates(request: NextRequest) {
  try {
    getAdminFromHeaders(request);

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      education: searchParams.get('education') || undefined,
      fromDate: searchParams.get('fromDate')
        ? new Date(searchParams.get('fromDate')!)
        : undefined,
      toDate: searchParams.get('toDate')
        ? new Date(searchParams.get('toDate')!)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : undefined,
    };

    const result = await adminService.getAllCandidates(filters);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetAllCandidates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function handleGetCandidateById(
  request: NextRequest,
  id: string
) {
  try {
    getAdminFromHeaders(request);

    const candidate = await adminService.getCandidateById(id);

    return NextResponse.json(candidate, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetCandidateById:', error);
    const status = error instanceof Error && error.message === 'Candidate not found' ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidate' },
      { status }
    );
  }
}

export async function handleDeleteCandidate(request: NextRequest, id: string) {
  try {
    const admin = getAdminFromHeaders(request);
    const ipAddress = getIpAddress(request);

    const deletedCandidate = await adminService.deleteCandidate(id);

    // Create audit log
    await auditService.createAuditLog({
      adminId: admin.userId,
      action: 'DELETE_CANDIDATE',
      entityType: 'CANDIDATE',
      entityId: id,
      details: {
        candidateName: deletedCandidate.fullName,
        email: deletedCandidate.email,
        city: deletedCandidate.city,
      },
      ipAddress,
    });

    return NextResponse.json(
      { message: 'Candidate deleted successfully', candidate: deletedCandidate },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in handleDeleteCandidate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}

// ============================================
// EMPLOYERS MANAGEMENT
// ============================================

export async function handleGetAllEmployers(request: NextRequest) {
  try {
    getAdminFromHeaders(request);

    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      industry: searchParams.get('industry') || undefined,
      fromDate: searchParams.get('fromDate')
        ? new Date(searchParams.get('fromDate')!)
        : undefined,
      toDate: searchParams.get('toDate')
        ? new Date(searchParams.get('toDate')!)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : undefined,
    };

    const result = await adminService.getAllEmployers(filters);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetAllEmployers:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch employers' },
      { status: 500 }
    );
  }
}

export async function handleGetEmployerById(request: NextRequest, id: string) {
  try {
    getAdminFromHeaders(request);

    const employer = await adminService.getEmployerById(id);

    return NextResponse.json({ employer }, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetEmployerById:', error);
    const status = error instanceof Error && error.message === 'Employer not found' ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch employer' },
      { status }
    );
  }
}

export async function handleDeleteEmployer(request: NextRequest, id: string) {
  try {
    const admin = getAdminFromHeaders(request);
    const ipAddress = getIpAddress(request);

    const deletedEmployer = await adminService.deleteEmployer(id);

    // Create audit log
    await auditService.createAuditLog({
      adminId: admin.userId,
      action: 'DELETE_EMPLOYER',
      entityType: 'EMPLOYER',
      entityId: id,
      details: {
        companyName: deletedEmployer.companyName,
        contactPerson: deletedEmployer.contactPerson,
        email: deletedEmployer.user.email,
      },
      ipAddress,
    });

    return NextResponse.json(
      { message: 'Employer deleted successfully', employer: deletedEmployer },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in handleDeleteEmployer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete employer' },
      { status: 500 }
    );
  }
}

// ============================================
// AUDIT LOGS
// ============================================

export async function handleGetAuditLogs(request: NextRequest) {
  try {
    getAdminFromHeaders(request);

    const { searchParams } = new URL(request.url);
    const filters = {
      adminId: searchParams.get('adminId') || undefined,
      action: searchParams.get('action') as auditService.AuditAction | undefined,
      entityType: searchParams.get('entityType') as auditService.EntityType | undefined,
      fromDate: searchParams.get('fromDate')
        ? new Date(searchParams.get('fromDate')!)
        : undefined,
      toDate: searchParams.get('toDate')
        ? new Date(searchParams.get('toDate')!)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : undefined,
    };

    const result = await auditService.getAuditLogs(filters);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetAuditLogs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

// ============================================
// PLATFORM SETTINGS
// ============================================

export async function handleGetPlatformSettings(request: NextRequest) {
  try {
    getAdminFromHeaders(request);

    const settings = await adminService.getPlatformSettings();

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error in handleGetPlatformSettings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch platform settings' },
      { status: 500 }
    );
  }
}

export async function handleUpdatePlatformSettings(request: NextRequest) {
  try {
    const admin = getAdminFromHeaders(request);
    const ipAddress = getIpAddress(request);
    const body = await request.json();

    const updatedSettings = await adminService.updatePlatformSettings(
      body,
      admin.userId
    );

    // Create audit log
    await auditService.createAuditLog({
      adminId: admin.userId,
      action: 'UPDATE_SETTINGS',
      entityType: 'SETTINGS',
      entityId: 'default',
      details: {
        changes: body,
      },
      ipAddress,
    });

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error('Error in handleUpdatePlatformSettings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update platform settings' },
      { status: 500 }
    );
  }
}
