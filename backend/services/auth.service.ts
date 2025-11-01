import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import type { LoginCredentials, RegisterData, AuthResponse, EmployerWithUser } from '../types';

/**
 * Register a new employer
 */
export async function registerEmployer(data: RegisterData): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user and employer profile in a transaction
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'EMPLOYER',
        employerProfile: {
          create: {
            companyName: data.companyName,
            contactPerson: data.contactPerson,
            companyWebsite: data.companyWebsite || null,
            phone: data.phone,
          },
        },
      },
      include: {
        employerProfile: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      message: 'Registration successful',
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'Registration failed. Please try again.',
    };
  }
}

/**
 * Login employer
 */
export async function loginEmployer(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        employerProfile: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  }
}

/**
 * Get employer profile by user ID
 */
export async function getEmployerProfile(userId: string): Promise<EmployerWithUser | null> {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return employerProfile;
  } catch (error) {
    console.error('Get employer profile error:', error);
    return null;
  }
}

/**
 * Update employer profile
 */
export async function updateEmployerProfile(
  userId: string,
  data: Partial<{
    companyName: string;
    contactPerson: string;
    companyWebsite: string | null;
    phone: string;
  }>
) {
  try {
    const updatedProfile = await prisma.employerProfile.update({
      where: { userId },
      data,
    });

    return {
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Update employer profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        employerProfile: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}
