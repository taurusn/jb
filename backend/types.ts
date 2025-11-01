// ============================================
// ENUMS (matching Prisma schema)
// ============================================
export type Role = 'EMPLOYER' | 'ADMIN';
export type EmployeeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ============================================
// USER & AUTH TYPES
// ============================================
export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  contactPerson: string;
  companyWebsite?: string;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: Role;
  };
  error?: string;
  message?: string;
}

// ============================================
// EMPLOYER TYPES
// ============================================
export interface EmployerProfileData {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  companyWebsite?: string | null;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployerWithUser extends EmployerProfileData {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

// ============================================
// EMPLOYEE TYPES
// ============================================
export interface EmployeeApplicationData {
  fullName: string;
  phone: string;
  email?: string | null;
  city: string;
  education: string;
  skills: string;
  experience: string;
  resumeUrl?: string | null;
  profilePictureUrl?: string | null;
}

export interface EmployeeApplicationResponse extends EmployeeApplicationData {
  id: string;
  submittedAt: Date;
}

export interface EmployeeApplicationWithRequests extends EmployeeApplicationResponse {
  employeeRequests: EmployeeRequestData[];
}

// ============================================
// EMPLOYEE REQUEST TYPES
// ============================================
export interface EmployeeRequestData {
  id: string;
  employeeId: string;
  employerId: string;
  status: EmployeeRequestStatus;
  notes?: string | null;
  requestedAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeRequestData {
  employeeId: string;
  employerId: string;
  notes?: string;
}

export interface EmployeeRequestWithDetails extends EmployeeRequestData {
  employee: EmployeeApplicationResponse;
  employer: EmployerProfileData;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================
// FILTER & SEARCH TYPES
// ============================================
export interface EmployeeFilters {
  city?: string;
  education?: string;
  skills?: string[];
  experience?: string;
  search?: string; // General search across multiple fields
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FILE UPLOAD TYPES
// ============================================
export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface FileUploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}
