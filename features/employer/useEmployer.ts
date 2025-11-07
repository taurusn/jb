'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface Applicant {
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
  availableTimeSlots?: string | null;
  requestStatus?: string;
  requestId?: string;
  requestedAt?: Date;
}

export interface EmployerStats {
  totalApplicants: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export interface EmployeeRequest {
  id: string;
  employeeId: string;
  employerId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  employee?: {
    fullName: string;
    email: string;
    position: string;
  };
}

// Hook for fetching unrequested applicants with pagination and filters
export interface UseApplicantsReturn {
  applicants: Applicant[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  fetchApplicants: (page?: number, filters?: ApplicantFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface ApplicantFilters {
  city?: string;
  education?: string;
  skills?: string;
  search?: string;
}

export const useApplicants = (): UseApplicantsReturn => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<ApplicantFilters>({});

  const fetchApplicants = async (page = 1, filters: ApplicantFilters = {}) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    setCurrentPage(page);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
      });

      const response = await apiClient.get<{
        data: Applicant[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/employer/applicants?${params}`);

      console.log('useApplicants response:', response);
      console.log('useApplicants response.success:', response.success);
      console.log('useApplicants response.data:', response.data);

      if (response.success && response.data) {
        console.log('Setting applicants to:', response.data.data);
        console.log('Number of applicants:', response.data.data.length);
        setApplicants(response.data.data);
        setTotalCount(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        console.log('Response not successful or no data:', response);
        throw new Error(response.error || 'Failed to fetch applicants');
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'An error occurred while fetching applicants');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchApplicants(currentPage, currentFilters);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  return {
    applicants,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    fetchApplicants,
    refetch,
  };
};

// Hook for fetching requested applicants with pagination and filters
export const useRequestedApplicants = (): UseApplicantsReturn => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<ApplicantFilters>({});

  const fetchApplicants = async (page = 1, filters: ApplicantFilters = {}) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    setCurrentPage(page);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
      });

      const response = await apiClient.get<{
        data: Applicant[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/employer/applicants/requested?${params}`);

      console.log('useRequestedApplicants response:', response);

      if (response.success && response.data) {
        setApplicants(response.data.data);
        setTotalCount(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        throw new Error(response.error || 'Failed to fetch requested applicants');
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'An error occurred while fetching requested applicants');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchApplicants(currentPage, currentFilters);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  return {
    applicants,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    fetchApplicants,
    refetch,
  };
};

// Hook for creating employee requests
export interface UseRequestReturn {
  createRequest: (employeeId: string, meetingDetails?: { meetingDate: string; meetingDuration: number }) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
}

export const useRequest = (): UseRequestReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createRequest = async (
    employeeId: string,
    meetingDetails?: { meetingDate: string; meetingDuration: number }
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient.post<{
        success: boolean;
        error?: string;
      }>('/employer/request', {
        employeeId,
        ...meetingDetails,
      });

      if (response.success) {
        setSuccess(true);
      } else {
        throw new Error(response.error || 'Failed to create request');
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || 'An error occurred while creating the request'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createRequest,
    loading,
    error,
    success,
    clearError,
  };
};

// Hook for fetching employer dashboard stats
export interface UseDashboardReturn {
  stats: EmployerStats | null;
  requests: EmployeeRequest[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch stats
      const statsResponse = await apiClient.get<EmployerStats>('/employer/stats');

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        throw new Error(statsResponse.error || 'Failed to fetch stats');
      }

      // Fetch requests
      const requestsResponse = await apiClient.get<EmployeeRequest[]>('/employer/request');

      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data);
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || 'An error occurred while fetching dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    requests,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};

// Hook for updating request status
export interface UseUpdateRequestStatusReturn {
  updateStatus: (requestId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', notes?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useUpdateRequestStatus = (): UseUpdateRequestStatusReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateStatus = async (requestId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', notes?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient.put<{
        success: boolean;
        error?: string;
      }>(`/employer/request/${requestId}`, { status, notes });

      if (response.success) {
        setSuccess(true);
      } else {
        throw new Error(response.error || 'Failed to update request status');
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || 'An error occurred while updating the request status'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    loading,
    error,
    success,
  };
};
