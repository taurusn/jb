'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, FileUpload, Navbar } from '@/components';
import { useEmployeeForm } from '@/features/employee/useEmployeeForm';

export default function HomePage() {
  const { submitApplication, loading, error, success, clearError } = useEmployeeForm();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    education: '',
    skills: '',
    experience: '',
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleResumeChange = (files: File[]) => {
    if (files.length > 0) {
      setResumeFile(files[0]);
    }
    clearError();
  };

  const handleProfilePictureChange = (files: File[]) => {
    if (files.length > 0) {
      setProfilePicture(files[0]);
    }
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      return;
    }

    await submitApplication({
      ...formData,
      resume: resumeFile,
      profilePicture: profilePicture || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-3 sm:px-4 overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-brand-yellow/20 via-brand-yellow/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tl from-brand-yellow/15 via-brand-yellow/5 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] bg-brand-yellow/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '20s' }}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-radial-gradient"></div>
          
          {/* Animated lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent animate-shimmer"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-yellow/10 to-transparent animate-shimmer" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-yellow/15 to-transparent animate-shimmer" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-slide-down">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold text-brand-light mb-4 sm:mb-5 lg:mb-6 px-2">
              Start Your{' '}
              <span className="text-gradient">Career Journey</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto px-4">
              Submit your application and get connected with leading employers looking for talent like you
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-20">
            {[
              { label: 'Active Employers', value: '50+' },
              { label: 'Jobs Posted', value: '200+' },
              { label: 'Applications', value: '1K+' },
              { label: 'Success Rate', value: '85%' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 text-center animate-scale-in hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-yellow mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 relative">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-12 shadow-dark-elevation animate-slide-up">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-light mb-2 sm:mb-3">
                Submit Your Application
              </h2>
              <p className="text-sm sm:text-base text-gray-400">
                Fill in your details and upload your CV to get started
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 sm:mb-6 bg-accent-green/10 border border-accent-green/50 rounded-lg p-3 sm:p-4 animate-bounce-in">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0"
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
                  <p className="text-xs sm:text-sm text-accent-green font-medium">
                    Application submitted successfully! Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 bg-accent-red/10 border border-accent-red/50 rounded-lg p-3 sm:p-4 animate-slide-down">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-accent-red flex-shrink-0"
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
                  <p className="text-xs sm:text-sm text-accent-red break-words">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Personal Information */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  Personal Information
                </h3>

                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  fullWidth
                  icon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    fullWidth
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    required
                    fullWidth
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* Location & Education */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  Location & Education
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Input
                    label="City"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                    fullWidth
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />

                  <Input
                    label="Education"
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Bachelor's in Computer Science"
                    required
                    fullWidth
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  Professional Details
                </h3>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-brand-light mb-1.5 sm:mb-2">
                    Skills <span className="text-brand-yellow">*</span>
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., JavaScript, React, Node.js, Python, SQL, etc."
                    required
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow hover:border-brand-yellow/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-brand-light mb-1.5 sm:mb-2">
                    Experience <span className="text-brand-yellow">*</span>
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Describe your work experience, projects, and achievements..."
                    required
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow hover:border-brand-yellow/50 resize-none"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    4
                  </span>
                  Upload Documents
                </h3>

                <FileUpload
                  label="Resume / CV"
                  accept=".pdf,.doc,.docx"
                  maxSize={5}
                  required
                  onChange={handleResumeChange}
                  helperText="Accepted formats: PDF, DOC, DOCX (Max 5MB)"
                />

                <FileUpload
                  label="Profile Picture (Optional)"
                  accept=".jpg,.jpeg,.png"
                  maxSize={2}
                  onChange={handleProfilePictureChange}
                  helperText="Accepted formats: JPG, PNG (Max 2MB)"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  <span className="hidden sm:inline">{loading ? 'Submitting Application...' : 'Submit Application'}</span>
                  <span className="sm:hidden">{loading ? 'Submitting...' : 'Submit'}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Employer CTA */}
          <div className="mt-8 sm:mt-10 lg:mt-12 text-center animate-fade-in">
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">Are you an employer looking for talent?</p>
            <Link href="/login">
              <Button variant="outline" size="md">
                <span className="hidden sm:inline">Employer Login →</span>
                <span className="sm:hidden">Employer Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 lg:py-12 px-3 sm:px-4 border-t border-dark-300">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="text-xs sm:text-sm">&copy; 2025 Job Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
