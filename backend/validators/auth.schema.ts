import { z } from 'zod';

// ============================================
// LOGIN SCHEMA
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// REGISTER SCHEMA
// ============================================
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long'),
  contactPerson: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Contact person name is too long'),
  companyWebsite: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// UPDATE EMPLOYER PROFILE SCHEMA
// ============================================
export const updateEmployerProfileSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long')
    .optional(),
  contactPerson: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Contact person name is too long')
    .optional(),
  companyWebsite: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
});

export type UpdateEmployerProfileInput = z.infer<typeof updateEmployerProfileSchema>;
