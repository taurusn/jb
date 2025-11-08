'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, FileUpload, Navbar } from '@/components';
import { useEmployeeForm } from '@/features/employee/useEmployeeForm';
import AvailabilitySelector from '@/components/interview/AvailabilitySelector';

export default function HomePage() {
  const { submitApplication, loading, error, success, clearError } = useEmployeeForm();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

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
  const [availability, setAvailability] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
    clearError();
  };

  const handleResumeChange = (files: File[]) => {
    if (files.length > 0) {
      setResumeFile(files[0]);
    }
    setValidationError(null);
    clearError();
  };

  const handleProfilePictureChange = (files: File[]) => {
    if (files.length > 0) {
      setProfilePicture(files[0]);
    }
    setValidationError(null);
    clearError();
  };

  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
    setValidationError(null);
    clearError();
  };

  // Validate current step (matches backend validation schema)
  const validateStep = (step: number): boolean => {
    setValidationError(null);
    clearError();

    switch (step) {
      case 1: // Personal Information
        // Full Name validation
        if (!formData.fullName.trim()) {
          setValidationError('Please enter your full name');
          return false;
        }
        if (formData.fullName.trim().length < 2) {
          setValidationError('Full name must be at least 2 characters');
          return false;
        }
        if (formData.fullName.length > 100) {
          setValidationError('Full name is too long (max 100 characters)');
          return false;
        }
        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
          setValidationError('Full name should only contain letters and spaces');
          return false;
        }

        // Email validation (optional but must be valid if provided)
        if (formData.email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            setValidationError('Please enter a valid email address');
            return false;
          }
        }

        // Phone validation
        if (!formData.phone.trim()) {
          setValidationError('Please enter your phone number');
          return false;
        }
        if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
          setValidationError('Phone number must be at least 10 digits');
          return false;
        }
        if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
          setValidationError('Invalid phone number format');
          return false;
        }
        return true;

      case 2: // Location & Education
        // City validation
        if (!formData.city.trim()) {
          setValidationError('Please enter your city');
          return false;
        }
        if (formData.city.trim().length < 2) {
          setValidationError('City name must be at least 2 characters');
          return false;
        }
        if (formData.city.length > 50) {
          setValidationError('City name is too long (max 50 characters)');
          return false;
        }

        // Education validation
        if (!formData.education.trim()) {
          setValidationError('Please enter your education details');
          return false;
        }
        if (formData.education.trim().length < 2) {
          setValidationError('Education information must be at least 2 characters');
          return false;
        }
        if (formData.education.length > 200) {
          setValidationError('Education information is too long (max 200 characters)');
          return false;
        }
        return true;

      case 3: // Professional Details
        // Skills validation
        if (!formData.skills.trim()) {
          setValidationError('Please list your skills');
          return false;
        }
        if (formData.skills.trim().length < 5) {
          setValidationError('Please provide at least 5 characters describing your skills');
          return false;
        }
        if (formData.skills.length > 1000) {
          setValidationError('Skills description is too long (max 1000 characters)');
          return false;
        }

        // Experience validation
        if (!formData.experience.trim()) {
          setValidationError('Please describe your experience');
          return false;
        }
        if (formData.experience.trim().length < 10) {
          setValidationError('Please provide at least 10 characters describing your experience');
          return false;
        }
        if (formData.experience.length > 2000) {
          setValidationError('Experience description is too long (max 2000 characters)');
          return false;
        }
        return true;

      case 4: // Interview Availability (optional)
        return true;

      case 5: // Upload Documents
        if (!resumeFile) {
          setValidationError('Please upload your resume/CV');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setValidationError(null);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      // Smooth scroll to form section
      setTimeout(() => {
        const formSection = document.getElementById('application-form');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    // Smooth scroll to form section
    setTimeout(() => {
      const formSection = document.getElementById('application-form');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(5)) {
      return;
    }

    await submitApplication({
      ...formData,
      resume: resumeFile,
      profilePicture: profilePicture || undefined,
      availableTimeSlots: availability || undefined,
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
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-light mb-2 sm:mb-3">
                Submit Your Application
              </h2>
              <p className="text-sm sm:text-base text-gray-400">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-xs sm:text-sm font-semibold text-brand-light">
                  Progress
                </span>
                <span className="text-xs sm:text-sm font-semibold text-brand-yellow">
                  {Math.round(((currentStep - 1) / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-dark-400 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-yellow to-yellow-400 rounded-full transition-all duration-500 ease-out shadow-yellow-glow"
                  style={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
                ></div>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between mt-4">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center ${
                      step <= currentStep ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step < currentStep
                          ? 'bg-accent-green text-white'
                          : step === currentStep
                          ? 'bg-brand-yellow text-brand-dark shadow-yellow-glow scale-110'
                          : 'bg-dark-400 text-gray-400 border-2 border-dark-300'
                      }`}
                    >
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className="text-xs mt-1 text-gray-400 hidden sm:block">
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Location'}
                      {step === 3 && 'Skills'}
                      {step === 4 && 'Availability'}
                      {step === 5 && 'Documents'}
                    </span>
                  </div>
                ))}
              </div>
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

            {/* Validation Error Message (Soft) */}
            {validationError && (
              <div className="mb-4 sm:mb-6 bg-accent-orange/10 border border-accent-orange/50 rounded-lg p-3 sm:p-4 animate-slide-down">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-accent-orange font-medium">{validationError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
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
                    label="Email Address (Optional)"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
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
              )}

              {/* Step 2: Location & Education */}
              {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
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
              )}

              {/* Step 3: Professional Details */}
              {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
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
              )}

              {/* Step 4: Interview Availability */}
              {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    4
                  </span>
                  Interview Availability
                </h3>

                <AvailabilitySelector
                  value={availability}
                  onChange={handleAvailabilityChange}
                  disabled={loading}
                />
              </div>
              )}

              {/* Step 5: File Uploads */}
              {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    5
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
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 sm:pt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handlePrevious}
                    disabled={loading}
                    className="flex-1"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={loading}
                    className={currentStep === 1 ? 'w-full' : 'flex-1'}
                  >
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="flex-1"
                  >
                    <span className="hidden sm:inline">{loading ? 'Submitting Application...' : 'Submit Application'}</span>
                    <span className="sm:hidden">{loading ? 'Submitting...' : 'Submit'}</span>
                  </Button>
                )}
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
