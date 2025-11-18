import { employeeApplicationSchema, employeeSearchSchema } from '../validators/employee.schema';
import {
  createEmployeeApplication,
  getEmployeeApplicationById,
  getEmployeeApplications,
  searchEmployeeApplications,
  getUnrequestedEmployeeApplications,
  getRequestedEmployeeApplications,
} from '../services/employee.service';
import type { ApiResponse, PaginatedResponse, EmployeeApplicationResponse } from '../types';

/**
 * Handle employee application submission
 */
export async function handleEmployeeSubmission(
  body: unknown
): Promise<ApiResponse<EmployeeApplicationResponse>> {
  try {
    // Validate input
    const validation = employeeApplicationSchema.safeParse(body);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      };
    }

    // Create application
    const result = await createEmployeeApplication(validation.data);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to submit application',
      };
    }

    return {
      success: true,
      data: result.data!,
      message: 'Application submitted successfully',
    };
  } catch (error) {
    console.error('Employee submission controller error:', error);
    return {
      success: false,
      error: 'An error occurred while submitting your application',
    };
  }
}

/**
 * Handle get employee application by ID
 */
export async function handleGetEmployee(
  id: string
): Promise<ApiResponse<EmployeeApplicationResponse>> {
  try {
    const employee = await getEmployeeApplicationById(id);

    if (!employee) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    return {
      success: true,
      data: employee,
    };
  } catch (error) {
    console.error('Get employee controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch application',
    };
  }
}

/**
 * Handle get all employees with filters and pagination
 */
export async function handleGetEmployees(
  query: unknown
): Promise<ApiResponse<PaginatedResponse<EmployeeApplicationResponse>>> {
  try {
    // Validate query parameters
    const validation = employeeSearchSchema.safeParse(query);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid query parameters',
      };
    }

    const { page, limit, search, skills, ...filters } = validation.data;

    // Convert skills string to array if provided
    const skillsArray = skills ? skills.split(',').map(s => s.trim()) : undefined;

    // Get employees
    const result = search
      ? await searchEmployeeApplications(search, { page, limit })
      : await getEmployeeApplications({ ...filters, skills: skillsArray }, { page, limit });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Get employees controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch applications',
    };
  }
}

/**
 * Handle search employees
 */
export async function handleSearchEmployees(
  searchQuery: string,
  page = 1,
  limit = 10
): Promise<ApiResponse<PaginatedResponse<EmployeeApplicationResponse>>> {
  try {
    const result = await searchEmployeeApplications(searchQuery, { page, limit });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Search employees controller error:', error);
    return {
      success: false,
      error: 'Search failed',
    };
  }
}

/**
 * Handle get unrequested employees for a specific employer
 */
export async function handleGetUnrequestedEmployees(
  employerId: string,
  query: unknown
): Promise<ApiResponse<PaginatedResponse<EmployeeApplicationResponse>>> {
  try {
    // Validate query parameters
    const validation = employeeSearchSchema.safeParse(query);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid query parameters',
      };
    }

    const { page, limit, search, skills, ...filters } = validation.data;

    // Convert skills string to array if provided
    const skillsArray = skills ? skills.split(',').map(s => s.trim()) : undefined;

    // Get unrequested employees
    const result = await getUnrequestedEmployeeApplications(
      employerId,
      { ...filters, skills: skillsArray, search },
      { page, limit }
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Get unrequested employees controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch unrequested applications',
    };
  }
}

/**
 * Handle get requested employees for a specific employer
 */
export async function handleGetRequestedEmployees(
  employerId: string,
  query: unknown
): Promise<ApiResponse<PaginatedResponse<EmployeeApplicationResponse & { requestStatus: string; requestId: string; requestedAt: Date }>>> {
  try {
    // Validate query parameters
    const validation = employeeSearchSchema.safeParse(query);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid query parameters',
      };
    }

    const { page, limit, search, skills, ...filters } = validation.data;

    // Convert skills string to array if provided
    const skillsArray = skills ? skills.split(',').map(s => s.trim()) : undefined;

    // Get requested employees
    const result = await getRequestedEmployeeApplications(
      employerId,
      { ...filters, skills: skillsArray, search },
      { page, limit }
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Get requested employees controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch requested applications',
    };
  }
}
