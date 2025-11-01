import { loginSchema, registerSchema } from '../validators/auth.schema';
import { loginEmployer, registerEmployer, getEmployerProfile } from '../services/auth.service';
import type { ApiResponse } from '../types';

/**
 * Handle user login
 */
export async function handleLogin(body: unknown): Promise<ApiResponse<{ token: string; user: unknown }>> {
  try {
    // Validate input
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      };
    }

    // Attempt login
    const result = await loginEmployer(validation.data);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Login failed',
      };
    }

    return {
      success: true,
      data: {
        token: result.token!,
        user: result.user!,
      },
      message: result.message,
    };
  } catch (error) {
    console.error('Login controller error:', error);
    return {
      success: false,
      error: 'An error occurred during login',
    };
  }
}

/**
 * Handle user registration
 */
export async function handleRegister(body: unknown): Promise<ApiResponse<{ token: string; user: unknown }>> {
  try {
    // Validate input
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Invalid input',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = validation.data;

    // Attempt registration
    const result = await registerEmployer(registerData);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Registration failed',
      };
    }

    return {
      success: true,
      data: {
        token: result.token!,
        user: result.user!,
      },
      message: result.message,
    };
  } catch (error) {
    console.error('Register controller error:', error);
    return {
      success: false,
      error: 'An error occurred during registration',
    };
  }
}

/**
 * Get employer profile
 */
export async function handleGetEmployerProfile(userId: string): Promise<ApiResponse<unknown>> {
  try {
    const profile = await getEmployerProfile(userId);

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Get employer profile controller error:', error);
    return {
      success: false,
      error: 'Failed to fetch profile',
    };
  }
}
