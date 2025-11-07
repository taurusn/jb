import { z } from 'zod';

// ============================================
// EMPLOYEE APPLICATION SCHEMA
// ============================================
export const employeeApplicationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Full name should only contain letters and spaces'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name is too long'),
  education: z
    .string()
    .min(2, 'Education information is required')
    .max(200, 'Education information is too long'),
  skills: z
    .string()
    .min(5, 'Please provide at least 5 characters describing your skills')
    .max(1000, 'Skills description is too long'),
  experience: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your experience')
    .max(2000, 'Experience description is too long'),
  resumeUrl: z
    .string()
    .min(1, 'Resume path is required')
    .optional(),
  profilePictureUrl: z
    .string()
    .min(1, 'Profile picture path is required')
    .optional(),
  availableTimeSlots: z
    .string()
    .optional(),
});

export type EmployeeApplicationInput = z.infer<typeof employeeApplicationSchema>;

// ============================================
// EMPLOYEE REQUEST SCHEMA
// ============================================
export const employeeRequestSchema = z.object({
  employeeId: z
    .string()
    .uuid('Invalid employee ID'),
  employerId: z
    .string()
    .uuid('Invalid employer ID'),
  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal('')),
  meetingLink: z
    .string()
    .optional(),
  meetingDate: z
    .coerce.date()
    .optional(),
  meetingDuration: z
    .number()
    .int()
    .positive()
    .optional(),
  meetingEndsAt: z
    .coerce.date()
    .optional(),
});

export type EmployeeRequestInput = z.infer<typeof employeeRequestSchema>;

// ============================================
// UPDATE EMPLOYEE REQUEST STATUS SCHEMA
// ============================================
export const updateRequestStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], {
    message: 'Status must be PENDING, APPROVED, or REJECTED',
  }),
  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal('')),
});

export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================
export const employeeSearchSchema = z.object({
  city: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type EmployeeSearchInput = z.infer<typeof employeeSearchSchema>;
