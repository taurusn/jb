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
    .min(1, 'Password is required'),
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
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
  industry: z
    .string()
    .min(1, 'Industry is required')
    .max(100, 'Industry name is too long'),
  companySize: z
    .string()
    .min(1, 'Company size is required'),
  commercialRegistrationNumber: z
    .string()
    .min(7, 'Commercial Registration Number must be at least 7 characters')
    .max(20, 'Commercial Registration Number is too long')
    .regex(/^[0-9]+$/, 'CR Number must contain only digits'),
  commercialRegistrationImageUrl: z
    .string()
    .min(1, 'Commercial Registration document is required'),
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
