'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  skills: string;
  experience: string;
  resume: File | null;
  profilePicture?: File | null;
  availableTimeSlots?: string; // JSON string of availability
}

export interface UseEmployeeFormReturn {
  submitApplication: (data: EmployeeFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
}

export const useEmployeeForm = (): UseEmployeeFormReturn => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitApplication = async (data: EmployeeFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!data.fullName || !data.phone || !data.city || !data.education || !data.skills || !data.experience) {
        throw new Error('Please fill in all required fields');
      }

      if (!data.resume) {
        throw new Error('Please upload your resume');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      if (data.email) formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('city', data.city);
      formData.append('education', data.education);
      formData.append('skills', data.skills);
      formData.append('experience', data.experience);
      formData.append('resume', data.resume);
      if (data.profilePicture) formData.append('profilePicture', data.profilePicture);
      if (data.availableTimeSlots) formData.append('availableTimeSlots', data.availableTimeSlots);

      // Submit to API
      const response = await fetch('/api/employee/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSuccess(true);
      
      // Redirect to thank you page after successful submission
      setTimeout(() => {
        router.push('/thank-you');
      }, 1000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred while submitting your application');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    submitApplication,
    loading,
    error,
    success,
    clearError,
  };
};
