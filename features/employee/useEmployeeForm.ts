'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  nationality: string;
  skills: string | string[]; // Accept both string and array formats
  experience: string;
  resume: File | null;
  video?: File | null; // Optional video - at least one of resume or video required
  profilePicture?: File | null;
  availableTimeSlots?: string; // JSON string of availability
  iqamaNumber: string;
  iqamaExpiryDate: string;
  kafeelNumber: string;
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
      if (!data.fullName || !data.phone || !data.city || !data.nationality || !data.skills || !data.experience) {
        throw new Error('Please fill in all required fields');
      }

      if (!data.resume && !data.video) {
        throw new Error('Please upload your resume or video (or both)');
      }

      if (!data.iqamaNumber || !data.iqamaExpiryDate || !data.kafeelNumber) {
        throw new Error('Please fill in all document information');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      if (data.email) formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('city', data.city);
      formData.append('nationality', data.nationality);
      // Convert skills array to comma-separated string
      const skillsString = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills;
      formData.append('skills', skillsString);
      formData.append('experience', data.experience);
      if (data.resume) formData.append('resume', data.resume);
      if (data.video) formData.append('video', data.video);
      if (data.profilePicture) formData.append('profilePicture', data.profilePicture);
      if (data.availableTimeSlots) formData.append('availableTimeSlots', data.availableTimeSlots);
      formData.append('iqamaNumber', data.iqamaNumber);
      formData.append('iqamaExpiryDate', data.iqamaExpiryDate);
      formData.append('kafeelNumber', data.kafeelNumber);

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

      // Store submission data in sessionStorage for thank-you page
      sessionStorage.setItem('submissionData', JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        nationality: data.nationality,
        skills: skillsString, // Use the converted string
        hasAvailability: !!data.availableTimeSlots,
        timestamp: new Date().toISOString(),
      }));

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
