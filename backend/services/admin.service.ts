import { prisma as db } from '@/lib/db';
import { EmployeeRequestStatus } from '@prisma/client';

/**
 * Admin Service
 * Handles all admin-specific database operations and business logic
 */

// ============================================
// DASHBOARD STATISTICS
// ============================================

export async function getDashboardStats() {
  try {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get totals
    const [
      totalCandidates,
      totalEmployers,
      totalRequests,
      candidatesLastMonth,
      candidatesThisMonth,
      employersLastMonth,
      employersThisMonth,
      requestsLastMonth,
      requestsThisMonth,
    ] = await Promise.all([
      db.employeeApplication.count(),
      db.employerProfile.count(),
      db.employeeRequest.count(),
      db.employeeApplication.count({
        where: {
          submittedAt: {
            gte: lastMonthStart,
            lt: currentMonthStart,
          },
        },
      }),
      db.employeeApplication.count({
        where: {
          submittedAt: {
            gte: currentMonthStart,
          },
        },
      }),
      db.employerProfile.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart,
          },
        },
      }),
      db.employerProfile.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
          },
        },
      }),
      db.employeeRequest.count({
        where: {
          requestedAt: {
            gte: lastMonthStart,
            lt: currentMonthStart,
          },
        },
      }),
      db.employeeRequest.count({
        where: {
          requestedAt: {
            gte: currentMonthStart,
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const candidatesGrowth =
      candidatesLastMonth > 0
        ? Math.round(
            ((candidatesThisMonth - candidatesLastMonth) / candidatesLastMonth) * 100
          )
        : candidatesThisMonth > 0
        ? 100
        : 0;

    const employersGrowth =
      employersLastMonth > 0
        ? Math.round(
            ((employersThisMonth - employersLastMonth) / employersLastMonth) * 100
          )
        : employersThisMonth > 0
        ? 100
        : 0;

    const requestsGrowth =
      requestsLastMonth > 0
        ? Math.round(
            ((requestsThisMonth - requestsLastMonth) / requestsLastMonth) * 100
          )
        : requestsThisMonth > 0
        ? 100
        : 0;

    // Get request status breakdown
    const [pendingRequests, approvedRequests, rejectedRequests] =
      await Promise.all([
        db.employeeRequest.count({
          where: { status: 'PENDING' },
        }),
        db.employeeRequest.count({
          where: { status: 'APPROVED' },
        }),
        db.employeeRequest.count({
          where: { status: 'REJECTED' },
        }),
      ]);

    // Active interviews today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const activeInterviewsToday = await db.employeeRequest.count({
      where: {
        meetingDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Requests over time (last 30 days)
    const requestsOverTime = await getRequestsOverTime(thirtyDaysAgo, now);

    // Top cities
    const topCities = await getTopCities();

    // Candidates by education
    const candidatesByEducation = await getCandidatesByEducation();

    return {
      totalCandidates,
      candidatesGrowth,
      totalEmployers,
      employersGrowth,
      totalRequests,
      requestsGrowth,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      activeInterviewsToday,
      requestsOverTime,
      requestsByStatus: {
        PENDING: pendingRequests,
        APPROVED: approvedRequests,
        REJECTED: rejectedRequests,
      },
      topCities,
      candidatesByEducation,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

async function getRequestsOverTime(startDate: Date, endDate: Date) {
  const requests = await db.employeeRequest.findMany({
    where: {
      requestedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      requestedAt: true,
    },
  });

  // Group by date
  const grouped: Record<string, number> = {};
  requests.forEach((req) => {
    const date = req.requestedAt.toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function getTopCities() {
  const candidates = await db.employeeApplication.groupBy({
    by: ['city'],
    _count: {
      city: true,
    },
    orderBy: {
      _count: {
        city: 'desc',
      },
    },
    take: 5,
  });

  return candidates.map((c) => ({
    city: c.city,
    count: c._count.city,
  }));
}

async function getCandidatesByEducation() {
  const candidates = await db.employeeApplication.groupBy({
    by: ['education'],
    _count: {
      education: true,
    },
    orderBy: {
      _count: {
        education: 'desc',
      },
    },
  });

  return candidates.map((c) => ({
    education: c.education,
    count: c._count.education,
  }));
}

// ============================================
// REQUESTS MANAGEMENT
// ============================================

export interface RequestFilters {
  status?: EmployeeRequestStatus;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export async function getAllRequests(filters: RequestFilters = {}) {
  const {
    status,
    search,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};

  if (status) where.status = status;
  if (fromDate || toDate) {
    where.requestedAt = {};
    if (fromDate) where.requestedAt.gte = fromDate;
    if (toDate) where.requestedAt.lte = toDate;
  }
  if (search) {
    where.OR = [
      { employee: { fullName: { contains: search, mode: 'insensitive' } } },
      { employer: { companyName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  try {
    const [requests, total] = await Promise.all([
      db.employeeRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              city: true,
            },
          },
          employer: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              phone: true,
            },
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.employeeRequest.count({ where }),
    ]);

    return {
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw new Error('Failed to fetch requests');
  }
}

export async function getRequestById(id: string) {
  try {
    const request = await db.employeeRequest.findUnique({
      where: { id },
      include: {
        employee: true,
        employer: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // Parse adminNotes if exists
    const parsedRequest = {
      ...request,
      adminNotes: request.adminNotes ? JSON.parse(request.adminNotes) : [],
    };

    return parsedRequest;
  } catch (error) {
    console.error('Error fetching request:', error);
    throw error;
  }
}

export async function updateRequestStatus(
  id: string,
  status: EmployeeRequestStatus
) {
  try {
    const request = await db.employeeRequest.update({
      where: { id },
      data: { status },
      include: {
        employee: true,
        employer: true,
      },
    });

    return request;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw new Error('Failed to update request status');
  }
}

export async function addAdminNote(
  id: string,
  note: string,
  adminEmail: string
) {
  try {
    const request = await db.employeeRequest.findUnique({
      where: { id },
      select: { adminNotes: true },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    const existingNotes = request.adminNotes
      ? JSON.parse(request.adminNotes)
      : [];
    const newNote = {
      text: note,
      adminEmail,
      timestamp: new Date().toISOString(),
    };

    const updatedNotes = [...existingNotes, newNote];

    const updatedRequest = await db.employeeRequest.update({
      where: { id },
      data: {
        adminNotes: JSON.stringify(updatedNotes),
      },
      include: {
        employee: true,
        employer: true,
      },
    });

    return updatedRequest;
  } catch (error) {
    console.error('Error adding admin note:', error);
    throw error;
  }
}

export async function deleteRequest(id: string) {
  try {
    const request = await db.employeeRequest.delete({
      where: { id },
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
        employer: {
          select: {
            companyName: true,
          },
        },
      },
    });

    return request;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw new Error('Failed to delete request');
  }
}

// ============================================
// CANDIDATES MANAGEMENT
// ============================================

export interface CandidateFilters {
  search?: string;
  city?: string;
  education?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export async function getAllCandidates(filters: CandidateFilters = {}) {
  const {
    search,
    city,
    education,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};

  if (city) where.city = city;
  if (education) where.education = education;
  if (fromDate || toDate) {
    where.submittedAt = {};
    if (fromDate) where.submittedAt.gte = fromDate;
    if (toDate) where.submittedAt.lte = toDate;
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { skills: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [candidates, total] = await Promise.all([
      db.employeeApplication.findMany({
        where,
        include: {
          _count: {
            select: {
              employeeRequests: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.employeeApplication.count({ where }),
    ]);

    return {
      candidates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw new Error('Failed to fetch candidates');
  }
}

export async function getCandidateById(id: string) {
  try {
    const candidate = await db.employeeApplication.findUnique({
      where: { id },
      include: {
        employeeRequests: {
          include: {
            employer: {
              select: {
                companyName: true,
                contactPerson: true,
                phone: true,
              },
            },
          },
          orderBy: {
            requestedAt: 'desc',
          },
        },
      },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    return candidate;
  } catch (error) {
    console.error('Error fetching candidate:', error);
    throw error;
  }
}

export async function deleteCandidate(id: string) {
  try {
    const candidate = await db.employeeApplication.delete({
      where: { id },
    });

    return candidate;
  } catch (error) {
    console.error('Error deleting candidate:', error);
    throw new Error('Failed to delete candidate');
  }
}

// ============================================
// EMPLOYERS MANAGEMENT
// ============================================

export interface EmployerFilters {
  search?: string;
  industry?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export async function getAllEmployers(filters: EmployerFilters = {}) {
  const { search, industry, fromDate, toDate, page = 1, limit = 20 } = filters;

  const where: any = {};

  if (industry) where.industry = industry;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  try {
    const [employers, total] = await Promise.all([
      db.employerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              employeeRequests: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.employerProfile.count({ where }),
    ]);

    return {
      employers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching employers:', error);
    throw new Error('Failed to fetch employers');
  }
}

export async function getEmployerById(id: string) {
  try {
    const employer = await db.employerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        employeeRequests: {
          include: {
            employee: {
              select: {
                fullName: true,
                phone: true,
                email: true,
                city: true,
              },
            },
          },
          orderBy: {
            requestedAt: 'desc',
          },
        },
      },
    });

    if (!employer) {
      throw new Error('Employer not found');
    }

    // Calculate stats
    const stats = {
      totalRequests: employer.employeeRequests.length,
      pendingRequests: employer.employeeRequests.filter(
        (r) => r.status === 'PENDING'
      ).length,
      approvedRequests: employer.employeeRequests.filter(
        (r) => r.status === 'APPROVED'
      ).length,
      rejectedRequests: employer.employeeRequests.filter(
        (r) => r.status === 'REJECTED'
      ).length,
      activeInterviews: employer.employeeRequests.filter(
        (r) => r.meetingDate && r.meetingDate > new Date()
      ).length,
    };

    return {
      ...employer,
      stats,
    };
  } catch (error) {
    console.error('Error fetching employer:', error);
    throw error;
  }
}

export async function deleteEmployer(id: string) {
  try {
    // Delete user (will cascade to employer profile and requests)
    const employer = await db.employerProfile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!employer) {
      throw new Error('Employer not found');
    }

    await db.user.delete({
      where: { id: employer.userId },
    });

    return employer;
  } catch (error) {
    console.error('Error deleting employer:', error);
    throw new Error('Failed to delete employer');
  }
}

// ============================================
// PLATFORM SETTINGS
// ============================================

export async function getPlatformSettings() {
  try {
    const settings = await db.platformSettings.findFirst({
      where: { id: 'default' },
    });

    if (!settings) {
      // Create default settings if they don't exist
      return await db.platformSettings.create({
        data: {
          id: 'default',
          maintenanceMode: false,
          allowNewRegistrations: true,
          allowNewApplications: true,
          platformName: 'Job Platform',
        },
      });
    }

    return settings;
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    throw new Error('Failed to fetch platform settings');
  }
}

export async function updatePlatformSettings(
  data: Partial<{
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    allowNewApplications: boolean;
    platformName: string;
    supportEmail: string;
    supportPhone: string;
  }>,
  adminId: string
) {
  try {
    const settings = await db.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        ...data,
        updatedBy: adminId,
      },
      create: {
        id: 'default',
        maintenanceMode: data.maintenanceMode ?? false,
        allowNewRegistrations: data.allowNewRegistrations ?? true,
        allowNewApplications: data.allowNewApplications ?? true,
        platformName: data.platformName ?? 'Job Platform',
        supportEmail: data.supportEmail,
        supportPhone: data.supportPhone,
        updatedBy: adminId,
      },
    });

    return settings;
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw new Error('Failed to update platform settings');
  }
}
