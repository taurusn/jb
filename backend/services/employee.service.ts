import { prisma } from '@/lib/db';
import type {
  EmployeeApplicationData,
  EmployeeApplicationResponse,
  EmployeeFilters,
  PaginationParams,
  PaginatedResponse,
} from '../types';

/**
 * Create a new employee application
 */
export async function createEmployeeApplication(
  data: EmployeeApplicationData
): Promise<{ success: boolean; data?: EmployeeApplicationResponse; error?: string }> {
  try {
    const application = await prisma.employeeApplication.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        city: data.city,
        education: data.education,
        skills: data.skills,
        experience: data.experience,
        resumeUrl: data.resumeUrl || null,
        profilePictureUrl: data.profilePictureUrl || null,
      },
    });

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error('Create employee application error:', error);
    return {
      success: false,
      error: 'Failed to submit application',
    };
  }
}

/**
 * Get employee application by ID
 */
export async function getEmployeeApplicationById(
  id: string
): Promise<EmployeeApplicationResponse | null> {
  try {
    const application = await prisma.employeeApplication.findUnique({
      where: { id },
    });

    return application;
  } catch (error) {
    console.error('Get employee application error:', error);
    return null;
  }
}

/**
 * Get all employee applications with optional filters and pagination
 */
export async function getEmployeeApplications(
  filters: EmployeeFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<EmployeeApplicationResponse>> {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.education) {
      where.education = { contains: filters.education, mode: 'insensitive' };
    }

    if (filters.experience) {
      where.experience = { contains: filters.experience, mode: 'insensitive' };
    }

    // General search across multiple fields
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { education: { contains: filters.search, mode: 'insensitive' } },
        { skills: { contains: filters.search, mode: 'insensitive' } },
        { experience: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Skills filter (array of skills)
    if (filters.skills && filters.skills.length > 0) {
      where.AND = filters.skills.map((skill) => ({
        skills: { contains: skill, mode: 'insensitive' },
      }));
    }

    // Get total count
    const total = await prisma.employeeApplication.count({ where });

    // Get applications
    const applications = await prisma.employeeApplication.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
    });

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Get employee applications error:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Search employee applications by query
 */
export async function searchEmployeeApplications(
  query: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<EmployeeApplicationResponse>> {
  return getEmployeeApplications({ search: query }, pagination);
}

/**
 * Delete employee application by ID
 */
export async function deleteEmployeeApplication(id: string): Promise<boolean> {
  try {
    await prisma.employeeApplication.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Delete employee application error:', error);
    return false;
  }
}

/**
 * Get employee applications count
 */
export async function getEmployeeApplicationsCount(): Promise<number> {
  try {
    const count = await prisma.employeeApplication.count();
    return count;
  } catch (error) {
    console.error('Get employee applications count error:', error);
    return 0;
  }
}

/**
 * Get unrequested employee applications for a specific employer
 */
export async function getUnrequestedEmployeeApplications(
  employerId: string,
  filters: EmployeeFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<EmployeeApplicationResponse>> {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.education) {
      where.education = { contains: filters.education, mode: 'insensitive' };
    }

    if (filters.experience) {
      where.experience = { contains: filters.experience, mode: 'insensitive' };
    }

    // General search across multiple fields
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { education: { contains: filters.search, mode: 'insensitive' } },
        { skills: { contains: filters.search, mode: 'insensitive' } },
        { experience: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      where.AND = filters.skills.map((skill) => ({
        skills: { contains: skill, mode: 'insensitive' },
      }));
    }

    // Exclude applications that have already been requested by this employer
    where.NOT = {
      employeeRequests: {
        some: {
          employerId: employerId,
        },
      },
    };

    // Get total count
    const total = await prisma.employeeApplication.count({ where });

    // Get applications
    const applications = await prisma.employeeApplication.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
    });

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Get unrequested employee applications error:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get requested employee applications for a specific employer with status
 */
export async function getRequestedEmployeeApplications(
  employerId: string,
  filters: EmployeeFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<EmployeeApplicationResponse & { requestStatus: string; requestId: string; requestedAt: Date }>> {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause for the applications
    const applicationWhere: Record<string, unknown> = {};

    if (filters.city) {
      applicationWhere.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.education) {
      applicationWhere.education = { contains: filters.education, mode: 'insensitive' };
    }

    if (filters.experience) {
      applicationWhere.experience = { contains: filters.experience, mode: 'insensitive' };
    }

    // General search across multiple fields
    if (filters.search) {
      applicationWhere.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { education: { contains: filters.search, mode: 'insensitive' } },
        { skills: { contains: filters.search, mode: 'insensitive' } },
        { experience: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      applicationWhere.AND = filters.skills.map((skill) => ({
        skills: { contains: skill, mode: 'insensitive' },
      }));
    }

    // Only include applications that have been requested by this employer
    applicationWhere.employeeRequests = {
      some: {
        employerId: employerId,
      },
    };

    // Get total count
    const total = await prisma.employeeApplication.count({ where: applicationWhere });

    // Get applications with request details (get more than needed for sorting)
    const applications = await prisma.employeeApplication.findMany({
      where: applicationWhere,
      orderBy: { submittedAt: 'desc' },
      include: {
        employeeRequests: {
          where: { employerId },
          select: {
            id: true,
            status: true,
            requestedAt: true,
          },
        },
      },
    });

    // Transform to include request status
    const transformedApplications = applications.map((app) => ({
      ...app,
      requestStatus: app.employeeRequests[0]?.status || 'PENDING',
      requestId: app.employeeRequests[0]?.id || '',
      requestedAt: app.employeeRequests[0]?.requestedAt || new Date(),
      employeeRequests: undefined, // Remove the nested object
    }));

    // Sort by status priority: PENDING first, then APPROVED and REJECTED at the end
    const statusPriority = { 'PENDING': 1, 'APPROVED': 2, 'REJECTED': 2 };
    const sortedApplications = transformedApplications.sort((a, b) => {
      const priorityA = statusPriority[a.requestStatus as keyof typeof statusPriority] || 1;
      const priorityB = statusPriority[b.requestStatus as keyof typeof statusPriority] || 1;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If both are at the same priority level (approved/rejected), sort by status name
      if (priorityA === 2) {
        if (a.requestStatus === 'APPROVED' && b.requestStatus === 'REJECTED') return -1;
        if (a.requestStatus === 'REJECTED' && b.requestStatus === 'APPROVED') return 1;
      }
      
      // If same status, sort by date (newest first)
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    // Apply pagination after sorting
    const paginatedApplications = sortedApplications.slice(skip, skip + limit);

    return {
      data: paginatedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Get requested employee applications error:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}
