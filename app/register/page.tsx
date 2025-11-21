'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Navbar } from '@/components';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationsAllowed, setRegistrationsAllowed] = useState<boolean | null>(null);
  const [checkingSettings, setCheckingSettings] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    industry: '',
    companySize: '',
    companyWebsite: '',
    commercialRegistrationNumber: '',
  });

  const [crImage, setCrImage] = useState<File | null>(null);
  const [crImagePreview, setCrImagePreview] = useState<string | null>(null);
  const [uploadingCr, setUploadingCr] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if registrations are allowed
  useEffect(() => {
    async function checkSettings() {
      try {
        const response = await fetch('/api/settings/public');
        if (response.ok) {
          const settings = await response.json();
          setRegistrationsAllowed(settings.allowNewRegistrations ?? true);
        } else {
          setRegistrationsAllowed(true); // Default to allowed on error
        }
      } catch (error) {
        console.error('Error checking settings:', error);
        setRegistrationsAllowed(true); // Default to allowed on error
      } finally {
        setCheckingSettings(false);
      }
    }
    checkSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);

    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('one special character');
    }

    return errors;
  };

  const handleCrImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFieldErrors({ crImage: 'Please upload a PDF or image file (JPG, PNG)' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors({ crImage: 'File size must be less than 5MB' });
        return;
      }

      setCrImage(file);
      // Clear error
      const newErrors = { ...fieldErrors };
      delete newErrors.crImage;
      setFieldErrors(newErrors);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCrImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setCrImagePreview(null); // PDF, no preview
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match' });
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        const errorMessage = `Password must contain ${passwordErrors.join(', ')}`;
        setFieldErrors({ password: errorMessage });
        throw new Error(errorMessage);
      }

      // Validate CR fields
      if (!formData.commercialRegistrationNumber) {
        setFieldErrors({ commercialRegistrationNumber: 'Commercial Registration Number is required' });
        throw new Error('Commercial Registration Number is required');
      }

      if (!crImage) {
        setFieldErrors({ crImage: 'Commercial Registration document is required' });
        throw new Error('Commercial Registration document is required');
      }

      // Upload CR image first
      setUploadingCr(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', crImage);
      uploadFormData.append('type', 'document');
      uploadFormData.append('subfolder', 'commercial-registrations');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload Commercial Registration document');
      }

      const uploadData = await uploadResponse.json();
      const crImageUrl = uploadData.url;
      setUploadingCr(false);

      // Register with CR fields
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          industry: formData.industry,
          companySize: formData.companySize,
          companyWebsite: formData.companyWebsite || undefined,
          commercialRegistrationNumber: formData.commercialRegistrationNumber,
          commercialRegistrationImageUrl: crImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error('Registration failed. Please try again.');
      }

      // Show success message (account is pending approval)
      setSuccessMessage(data.message || 'Registration successful! Your account is pending approval.');

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
      setUploadingCr(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-down">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-light mb-4">
              Register as <span className="text-gradient">Employer</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Create an account to post jobs and find top talent
            </p>
          </div>

          {/* Registration Form */}
          <div className="glass rounded-2xl p-8 md:p-10 shadow-dark-elevation animate-slide-up">
            {/* Loading state while checking settings */}
            {checkingSettings ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-brand-light text-lg">Loading...</p>
              </div>
            ) : registrationsAllowed === false ? (
              /* Registrations closed message */
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-light mb-4">
                  Registrations Currently Closed
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  We're not accepting new employer registrations at this time.
                </p>
                <p className="text-gray-400 mb-6">
                  Please check back later or contact support for more information.
                </p>
                <Link href="/login">
                  <Button variant="outline" size="md">
                    Already have an account? Login
                  </Button>
                </Link>
              </div>
            ) : (
              /* Normal form when registrations are allowed */
              <>
                {error && (
                  <div className="mb-6 bg-accent-red/10 border border-accent-red/50 rounded-lg p-4 animate-slide-down">
                    <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-accent-red flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-accent-red">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 bg-accent-green/10 border border-accent-green/50 rounded-lg p-4 animate-slide-down">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-accent-green flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-accent-green">{successMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-sm font-bold">
                    1
                  </span>
                  Account Information
                </h3>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    required
                    fullWidth
                    disabled={loading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-accent-red">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      required
                      fullWidth
                      disabled={loading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      }
                    />
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs text-accent-red">{fieldErrors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Must include: uppercase, lowercase, number, special character
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      required
                      fullWidth
                      disabled={loading}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      }
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-accent-red">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-sm font-bold">
                    2
                  </span>
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    required
                    fullWidth
                    disabled={loading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    }
                  />

                  <Input
                    label="Contact Person"
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    fullWidth
                    disabled={loading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0501234567"
                    required
                    fullWidth
                    disabled={loading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    }
                  />

                  <div>
                    <label className="block text-sm font-semibold text-brand-light mb-2">
                      Industry <span className="text-brand-yellow">*</span>
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow hover:border-brand-yellow/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-light mb-2">
                      Company Size <span className="text-brand-yellow">*</span>
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow hover:border-brand-yellow/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>

                  <Input
                    label="Website (Optional)"
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    fullWidth
                    disabled={loading}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    }
                  />
                </div>

                {/* Commercial Registration Section */}
                <div className="border-t-2 border-dark-300 pt-6">
                  <h3 className="text-lg font-display font-bold text-brand-yellow mb-4">
                    Commercial Registration
                  </h3>

                  <div className="space-y-4">
                    <Input
                      label="Commercial Registration Number"
                      type="text"
                      name="commercialRegistrationNumber"
                      value={formData.commercialRegistrationNumber}
                      onChange={handleChange}
                      placeholder="e.g., 1234567890"
                      fullWidth
                      required
                      disabled={loading}
                      error={fieldErrors.commercialRegistrationNumber}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    />

                    <div>
                      <label className="block text-sm font-semibold text-brand-light mb-2">
                        Commercial Registration Document <span className="text-brand-yellow">*</span>
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        Upload a clear image or PDF of your Commercial Registration (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCrImageChange}
                        disabled={loading}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-brand-dark hover:file:bg-brand-yellow/90 file:transition-all file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {fieldErrors.crImage && (
                        <p className="mt-2 text-sm text-red-400">{fieldErrors.crImage}</p>
                      )}
                      {crImagePreview && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-400 mb-2">Preview:</p>
                          <img
                            src={crImagePreview}
                            alt="CR Preview"
                            className="w-full max-w-md rounded-lg border-2 border-dark-300"
                          />
                        </div>
                      )}
                      {crImage && !crImagePreview && (
                        <p className="mt-2 text-sm text-green-400">
                          ✓ {crImage.name} selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading || uploadingCr}
                  loading={loading || uploadingCr}
                >
                  {uploadingCr ? 'Uploading CR Document...' : loading ? 'Creating Account...' : 'Create Employer Account'}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-yellow hover:text-brand-yellow/80 font-semibold transition-colors">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
              </>
            )}
          </div>

          {/* Employee Link */}
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-gray-400 mb-4">Looking for a job?</p>
            <Link href="/">
              <Button variant="outline" size="md">
                ← Back to Job Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
