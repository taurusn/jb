import { prisma } from '@/lib/db';
import type {
  EmployeeRequestData,
  CreateEmployeeRequestData,
  EmployeeRequestWithDetails,
  EmployeeApplicationResponse,
} from '../types';

/**
 * Create a new employee request (employer demands an employee)
 */
export async function createEmployeeRequest(
  data: CreateEmployeeRequestData
): Promise<{ success: boolean; data?: EmployeeRequestData; error?: string }> {
  try {
    // Check if request already exists
    const existingRequest = await prisma.employeeRequest.findUnique({
      where: {
        employeeId_employerId: {
          employeeId: data.employeeId,
          employerId: data.employerId,
        },
      },
    });

    if (existingRequest) {
      return {
        success: false,
        error: 'You have already requested this employee',
      };
    }

    // Create the request
    const request = await prisma.employeeRequest.create({
      data: {
        employeeId: data.employeeId,
        employerId: data.employerId,
        notes: data.notes || null,
        status: 'PENDING',
        meetingLink: data.meetingLink || null,
        meetingDate: data.meetingDate || null,
        meetingDuration: data.meetingDuration || null,
        meetingEndsAt: data.meetingEndsAt || null,
      },
    });

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    console.error('Create employee request error:', error);
    return {
      success: false,
      error: 'Failed to create request',
    };
  }
}

/**
 * Get all requests made by a specific employer
 */
export async function getEmployerRequests(
  employerId: string
): Promise<EmployeeRequestWithDetails[]> {
  try {
    const requests = await prisma.employeeRequest.findMany({
      where: { employerId },
      include: {
        employee: true,
        employer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return requests as unknown as EmployeeRequestWithDetails[];
  } catch (error) {
    console.error('Get employer requests error:', error);
    return [];
  }
}

/**
 * Get request by ID
 */
export async function getEmployeeRequestById(
  requestId: string
): Promise<EmployeeRequestWithDetails | null> {
  try {
    const request = await prisma.employeeRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: true,
        employer: true,
      },
    });

    return request as unknown as EmployeeRequestWithDetails | null;
  } catch (error) {
    console.error('Get employee request error:', error);
    return null;
  }
}

/**
 * Update employee request status
 */
export async function updateEmployeeRequestStatus(
  requestId: string,
  employerId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  notes?: string
): Promise<{ success: boolean; data?: EmployeeRequestData; error?: string }> {
  try {
    // First verify that the request exists and belongs to this employer
    const existingRequest = await prisma.employeeRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return {
        success: false,
        error: 'Request not found',
      };
    }

    if (existingRequest.employerId !== employerId) {
      return {
        success: false,
        error: 'You are not authorized to update this request',
      };
    }

    // Update the request
    const request = await prisma.employeeRequest.update({
      where: { id: requestId },
      data: {
        status,
        notes: notes || undefined,
      },
    });

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    console.error('Update employee request status error:', error);
    return {
      success: false,
      error: 'Failed to update request status',
    };
  }
}

/**
 * Delete employee request
 */
export async function deleteEmployeeRequest(requestId: string): Promise<boolean> {
  try {
    await prisma.employeeRequest.delete({
      where: { id: requestId },
    });
    return true;
  } catch (error) {
    console.error('Delete employee request error:', error);
    return false;
  }
}

/**
 * Check if employer has already requested an employee
 */
export async function hasEmployerRequestedEmployee(
  employeeId: string,
  employerId: string
): Promise<boolean> {
  try {
    const request = await prisma.employeeRequest.findUnique({
      where: {
        employeeId_employerId: {
          employeeId,
          employerId,
        },
      },
    });

    return !!request;
  } catch (error) {
    console.error('Check employer request error:', error);
    return false;
  }
}

/**
 * Get all applicants with their request status for a specific employer
 */
export async function getApplicantsWithRequestStatus(
  employerId: string
): Promise<(EmployeeApplicationResponse & { requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null })[]> {
  try {
    const applicants = await prisma.employeeApplication.findMany({
      include: {
        employeeRequests: {
          where: { employerId },
          select: {
            status: true,
            id: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Transform to include request status
    return applicants.map((applicant: {
      id: string;
      fullName: string;
      phone: string;
      email: string | null;
      city: string;
      education: string;
      skills: string;
      experience: string;
      resumeUrl: string | null;
      profilePictureUrl: string | null;
      submittedAt: Date;
      employeeRequests: Array<{ status: 'PENDING' | 'APPROVED' | 'REJECTED'; id: string }>;
    }) => ({
      ...applicant,
      requestStatus: applicant.employeeRequests[0]?.status || null,
    }));
  } catch (error) {
    console.error('Get applicants with request status error:', error);
    return [];
  }
}

/**
 * Get employer statistics
 */
export async function getEmployerStats(employerId: string) {
  try {
    // Get total applicants count
    const totalApplicants = await prisma.employeeApplication.count();

    const totalRequests = await prisma.employeeRequest.count({
      where: { employerId },
    });

    const pendingRequests = await prisma.employeeRequest.count({
      where: { employerId, status: 'PENDING' },
    });

    const approvedRequests = await prisma.employeeRequest.count({
      where: { employerId, status: 'APPROVED' },
    });

    const rejectedRequests = await prisma.employeeRequest.count({
      where: { employerId, status: 'REJECTED' },
    });

    return {
      totalApplicants,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    };
  } catch (error) {
    console.error('Get employer stats error:', error);
    return {
      totalApplicants: 0,
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
    };
  }
}
