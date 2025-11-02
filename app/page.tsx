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
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 px-3 sm:px-4 overflow-hidden">
        {/* Simplified Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Single subtle gradient orb */}
          <div className="absolute top-1/4 right-0 w-96 h-96 sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-brand-yellow/10 via-brand-yellow/5 to-transparent rounded-full blur-3xl animate-float"></div>

          {/* Subtle radial gradient */}
          <div className="absolute inset-0 bg-radial-gradient opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Split Layout: Content Left, Visual Right */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-20 lg:mb-24">
            {/* Left: Hero Content */}
            <div className="text-center lg:text-left animate-slide-down">
              <div className="inline-block mb-4 px-4 py-2 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full">
                <span className="text-xs sm:text-sm font-semibold text-brand-yellow">Apply in Minutes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-brand-light mb-4 sm:mb-6 leading-tight">
                Land Your Next{' '}
                <span className="text-gradient">Opportunity</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                One simple application connects you with employers actively seeking talent. No complicated processes, no endless forms.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#application-form">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Application
                  </Button>
                </a>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Employer Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/20 to-transparent rounded-3xl blur-2xl"></div>

                {/* Main visual card */}
                <div className="relative glass rounded-2xl p-8 space-y-6">
                  {/* Application preview mockup */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-dark-300 rounded-full w-3/4 mb-2"></div>
                        <div className="h-2 bg-dark-300/50 rounded-full w-1/2"></div>
                      </div>
                    </div>

                    <div className="space-y-3 pl-2 border-l-2 border-brand-yellow/30">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2 pl-4">
                          <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                          <div className="h-2 bg-dark-300/50 rounded-full flex-1"></div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex gap-2">
                      <div className="h-10 bg-brand-yellow/20 rounded-lg flex-1"></div>
                      <div className="h-10 bg-dark-300/30 rounded-lg w-24"></div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 glass rounded-xl px-4 py-3 animate-bounce-in shadow-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-accent-green">Quick Apply</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights - Replace Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Fast Application',
                description: 'Complete your profile in under 5 minutes',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'Direct Employer Access',
                description: 'Your profile reaches hiring managers directly',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Secure & Private',
                description: 'Your information is protected and confidential',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-5 sm:p-6 animate-scale-in hover:scale-105 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-yellow/20 transition-colors">
                  <div className="text-brand-yellow">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-brand-light mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 relative">
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
