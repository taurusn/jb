import { employeeRequestSchema, updateRequestStatusSchema } from '../validators/employee.schema';
import {
  createEmployeeRequest,
  getEmployerRequests,
  getEmployeeRequestById,
  updateEmployeeRequestStatus,
  getApplicantsWithRequestStatus,
  getEmployerStats,
} from '../services/employer.service';
import type { ApiResponse, EmployeeRequestData, EmployeeRequestWithDetails } from '../types';

/**
 * Handle create employee request (employer demands an employee)
 */
export async function handleCreateEmployeeRequest(
  body: unknown
): Promise<ApiResponse<EmployeeRequestData>> {
  try {
    // Validate input
    const validation = employeeRequestSchema.safeParse(body);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      };
    }

    // Create request
    const result = await createEmployeeRequest(validation.data);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to create request',
      };
    }

    return {
      success: true,
      data: result.data!,
      message: 'Request created successfully',
    };
  } catch (error) {
    console.error('Create employee request controller error:', error);
    return {
      success: false,
      error: 'An error occurred while creating the request',
    };
  }
}

/**
 * Handle get all requests for an employer
 */
export async function handleGetEmployerRequests(
  employerId: string
): Promise<ApiResponse<EmployeeRequestWithDetails[]>> {
  try {
    const requests = await getEmployerRequests(employerId);

    return {
      success: true,
      data: requests,
    };
  } catch (error) {
    console.error('Get employer requests controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch requests',
    };
  }
}

/**
 * Handle get request by ID
 */
export async function handleGetEmployeeRequest(
  requestId: string
): Promise<ApiResponse<EmployeeRequestWithDetails>> {
  try {
    const request = await getEmployeeRequestById(requestId);

    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }

    return {
      success: true,
      data: request,
    };
  } catch (error) {
    console.error('Get employee request controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch request',
    };
  }
}

/**
 * Handle update request status
 */
export async function handleUpdateRequestStatus(
  requestId: string,
  employerId: string,
  body: unknown
): Promise<ApiResponse<EmployeeRequestData>> {
  try {
    // Validate input
    const validation = updateRequestStatusSchema.safeParse(body);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      };
    }

    // Update request
    const result = await updateEmployeeRequestStatus(
      requestId,
      employerId,
      validation.data.status,
      validation.data.notes || undefined
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to update request',
      };
    }

    return {
      success: true,
      data: result.data!,
      message: 'Request status updated successfully',
    };
  } catch (error) {
    console.error('Update request status controller error:', error);
    return {
      success: false,
      error: 'An error occurred while updating the request',
    };
  }
}

/**
 * Handle get applicants with request status
 */
export async function handleGetApplicantsWithStatus(
  employerId: string
): Promise<ApiResponse<unknown[]>> {
  try {
    const applicants = await getApplicantsWithRequestStatus(employerId);

    return {
      success: true,
      data: applicants,
    };
  } catch (error) {
    console.error('Get applicants with status controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch applicants',
    };
  }
}

/**
 * Handle get employer statistics
 */
export async function handleGetEmployerStats(employerId: string): Promise<ApiResponse<unknown>> {
  try {
    const stats = await getEmployerStats(employerId);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Get employer stats controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch statistics',
    };
  }
}
