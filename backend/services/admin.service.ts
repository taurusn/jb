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

    // Candidates by nationality
    const candidatesByNationality = await getCandidatesByNationality();

    // Skills analytics
    const skillsDistribution = await getSkillsDistribution();
    const topSkills = await getTopSkills(8); // Top 8 skills

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
      candidatesByNationality,
      skillsDistribution,
      topSkills,
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

async function getCandidatesByNationality() {
  const candidates = await db.employeeApplication.groupBy({
    by: ['nationality'],
    _count: {
      nationality: true,
    },
    orderBy: {
      _count: {
        nationality: 'desc',
      },
    },
  });

  return candidates.map((c) => ({
    nationality: c.nationality,
    count: c._count.nationality,
  }));
}

async function getSkillsDistribution() {
  // Get all candidates with their skills
  const candidates = await db.employeeApplication.findMany({
    select: {
      skills: true,
    },
  });

  // Parse skills and count occurrences
  const skillCounts: Record<string, number> = {};

  candidates.forEach((candidate) => {
    if (candidate.skills) {
      // Split comma-separated skills
      const skillsArray = candidate.skills.split(',').map(s => s.trim()).filter(Boolean);
      skillsArray.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    }
  });

  // Convert to array and sort by count
  const skillsDistribution = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  return skillsDistribution;
}

async function getTopSkills(limit: number = 5) {
  const skillsDistribution = await getSkillsDistribution();
  return skillsDistribution.slice(0, limit);
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

    // Parse adminNotes if exists (with error handling)
    let adminNotes = [];
    if (request.adminNotes) {
      try {
        adminNotes = JSON.parse(request.adminNotes);
        // Validate it's an array
        if (!Array.isArray(adminNotes)) {
          console.warn(`Invalid adminNotes format for request ${id}. Expected array, got:`, typeof adminNotes);
          adminNotes = [];
        }
      } catch (parseError) {
        console.error(`Failed to parse adminNotes for request ${id}:`, parseError);
        adminNotes = [];
      }
    }

    const parsedRequest = {
      ...request,
      adminNotes,
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

    // Parse existing notes with error handling
    let existingNotes = [];
    if (request.adminNotes) {
      try {
        existingNotes = JSON.parse(request.adminNotes);
        // Validate it's an array
        if (!Array.isArray(existingNotes)) {
          console.warn(`Invalid adminNotes format for request ${id}. Resetting to empty array.`);
          existingNotes = [];
        }
      } catch (parseError) {
        console.error(`Failed to parse existing adminNotes for request ${id}:`, parseError);
        existingNotes = [];
      }
    }

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
  nationality?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export async function getAllCandidates(filters: CandidateFilters = {}) {
  const {
    search,
    city,
    nationality,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};

  if (city) where.city = city;
  if (nationality) where.nationality = nationality;
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
              status: true,
              commercialRegistrationNumber: true,
              commercialRegistrationImageUrl: true,
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
            role: true,
            commercialRegistrationNumber: true,
            commercialRegistrationImageUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        employeeRequests: {
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                city: true,
                nationality: true,
                skills: true,
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

// ============================================
// EMPLOYER APPROVAL MANAGEMENT
// ============================================

/**
 * Get all pending employers awaiting approval
 */
export async function getPendingEmployers() {
  try {
    const pendingEmployers = await db.user.findMany({
      where: {
        role: 'EMPLOYER',
        status: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        commercialRegistrationNumber: true,
        commercialRegistrationImageUrl: true,
        status: true,
        createdAt: true,
        employerProfile: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            phone: true,
            companyWebsite: true,
            industry: true,
            companySize: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pendingEmployers;
  } catch (error) {
    console.error('Error fetching pending employers:', error);
    throw new Error('Failed to fetch pending employers');
  }
}

/**
 * Approve an employer application
 */
export async function approveEmployer(employerId: string, adminId: string) {
  try {
    // Update employer status to APPROVED
    const employer = await db.user.update({
      where: { id: employerId },
      data: { status: 'APPROVED' },
      include: {
        employerProfile: true,
      },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        adminId,
        action: 'APPROVE_EMPLOYER',
        entityType: 'EMPLOYER',
        entityId: employerId,
        details: JSON.stringify({
          email: employer.email,
          companyName: employer.employerProfile?.companyName,
          previousStatus: 'PENDING',
          newStatus: 'APPROVED',
        }),
      },
    });

    return employer;
  } catch (error) {
    console.error('Error approving employer:', error);
    throw new Error('Failed to approve employer');
  }
}

/**
 * Reject an employer application
 */
export async function rejectEmployer(employerId: string, adminId: string, reason?: string) {
  try {
    // Update employer status to REJECTED
    const employer = await db.user.update({
      where: { id: employerId },
      data: { status: 'REJECTED' },
      include: {
        employerProfile: true,
      },
    });

    // Log the action
    await db.auditLog.create({
      data: {
        adminId,
        action: 'REJECT_EMPLOYER',
        entityType: 'EMPLOYER',
        entityId: employerId,
        details: JSON.stringify({
          email: employer.email,
          companyName: employer.employerProfile?.companyName,
          previousStatus: 'PENDING',
          newStatus: 'REJECTED',
          reason: reason || 'No reason provided',
        }),
      },
    });

    return employer;
  } catch (error) {
    console.error('Error rejecting employer:', error);
    throw new Error('Failed to reject employer');
  }
}

// ============================================
// INTERVIEW MANAGEMENT
// ============================================

/**
 * Get interview statistics for admin dashboard
 */
export async function getInterviewStats() {
  try {
    const now = new Date();

    // Today's date range
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Next 7 days
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);

    // Current month start
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayCount,
      upcomingCount,
      completedThisMonth,
      totalScheduled,
      avgDuration,
    ] = await Promise.all([
      // Today's interviews
      db.employeeRequest.count({
        where: {
          meetingDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Upcoming in next 7 days
      db.employeeRequest.count({
        where: {
          meetingDate: {
            gt: now,
            lte: next7Days,
          },
        },
      }),
      // Completed this month
      db.employeeRequest.count({
        where: {
          meetingEndsAt: {
            lt: now,
            gte: currentMonthStart,
          },
        },
      }),
      // Total scheduled all time
      db.employeeRequest.count({
        where: {
          meetingDate: { not: null },
        },
      }),
      // Average duration
      db.employeeRequest.aggregate({
        where: {
          meetingDuration: { not: null },
        },
        _avg: {
          meetingDuration: true,
        },
      }),
    ]);

    return {
      todayCount,
      upcomingCount,
      completedThisMonth,
      totalScheduled,
      averageDuration: Math.round(avgDuration._avg.meetingDuration || 0),
    };
  } catch (error) {
    console.error('Error fetching interview stats:', error);
    throw new Error('Failed to fetch interview statistics');
  }
}

/**
 * Get interviews with filtering and pagination
 */
export async function getInterviews(filters: {
  search?: string;
  status?: 'live' | 'upcoming' | 'completed' | 'all';
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  page?: number;
  limit?: number;
}) {
  try {
    const {
      search,
      status = 'all',
      startDate,
      endDate,
      duration,
      page = 1,
      limit = 20,
    } = filters;

    const now = new Date();
    const skip = (page - 1) * limit;

    // Build where clause - only require meetingDate (not meetingLink)
    const where: any = {
      meetingDate: { not: null },
    };

    // Status filtering
    if (status === 'live') {
      where.meetingDate = { lte: now };
      where.meetingEndsAt = { gte: now };
    } else if (status === 'upcoming') {
      where.meetingDate = { gt: now };
    } else if (status === 'completed') {
      where.meetingEndsAt = { lt: now };
    }

    // Date range filtering
    if (startDate && endDate) {
      where.meetingDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Duration filtering
    if (duration) {
      where.meetingDuration = duration;
    }

    // Search filtering (employer company name or candidate name)
    if (search) {
      where.OR = [
        {
          employer: {
            profile: {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          employee: {
            fullName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [interviews, total] = await Promise.all([
      db.employeeRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              skills: true,
              experience: true,
              profilePictureUrl: true,
            },
          },
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
        orderBy: {
          meetingDate: status === 'completed' ? 'desc' : 'asc',
        },
        skip,
        take: limit,
      }),
      db.employeeRequest.count({ where }),
    ]);

    return {
      interviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching interviews:', error);
    throw new Error('Failed to fetch interviews');
  }
}

/**
 * Get interview details by request ID
 */
export async function getInterviewById(requestId: string) {
  try {
    const interview = await db.employeeRequest.findUnique({
      where: { id: requestId },
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
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    return interview;
  } catch (error) {
    console.error('Error fetching interview:', error);
    throw new Error('Failed to fetch interview details');
  }
}
