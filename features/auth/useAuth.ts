'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  contactPerson: string;
  phone: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  loading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ user: unknown }>(
        '/auth/login',
        credentials
      );

      if (response.success) {
        // Redirect to dashboard on successful login
        router.push('/employer/dashboard');
      } else {
        setError({
          message: response.error || 'Login failed',
        });
      }
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message || 'An error occurred during login',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { login, loading, error, clearError };
};

export interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<void>;
  loading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export const useRegister = (): UseRegisterReturn => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ user: unknown }>(
        '/auth/register',
        data
      );

      if (response.success) {
        // Redirect to dashboard after successful registration
        router.push('/employer/dashboard');
      } else {
        setError({
          message: response.error || 'Registration failed',
        });
      }
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message || 'An error occurred during registration',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { register, loading, error, clearError };
};

export interface UseLogoutReturn {
  logout: () => Promise<void>;
  loading: boolean;
  error: AuthError | null;
}

export const useLogout = (): UseLogoutReturn => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/logout');
      // Redirect to home after logout
      router.push('/');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError({
        message: error.response?.data?.error || 'An error occurred during logout',
      });
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
};
