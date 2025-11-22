'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, FileUpload, Navbar, SkillSelector } from '@/components';
import { useEmployeeForm } from '@/features/employee/useEmployeeForm';
import AvailabilitySelector from '@/components/interview/AvailabilitySelector';

// Translations
const translations = {
  ar: {
    applyInMinutes: 'قدّم في دقائق',
    landYourNext: 'احصل على فرصتك',
    opportunity: 'القادمة',
    simpleApplication: 'طلب واحد بسيط يربطك بأصحاب العمل الذين يبحثون بنشاط عن المواهب. لا عمليات معقدة، ولا نماذج لا نهاية لها.',
    startApplication: 'ابدأ التقديم',
    forEmployers: 'لأصحاب العمل',
    applicationForm: 'نموذج التقديم',
    step: 'الخطوة',
    personalInfo: 'المعلومات الشخصية',
    contactInfo: 'معلومات الاتصال',
    skillsExperience: 'المهارات والخبرة',
    documentsLegal: 'المستندات والأوراق القانونية',
    availability: 'التوفر',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    city: 'المدينة',
    nationality: 'الجنسية',
    skills: 'المهارات',
    experience: 'الخبرة',
    resume: 'السيرة الذاتية',
    video: 'فيديو تعريفي',
    uploadResumeOrVideo: 'يجب رفع السيرة الذاتية أو الفيديو (أو كليهما)',
    videoHelper: 'حد أقصى 100 ميجابايت - MP4, WebM, MOV (حوالي دقيقتين)',
    resumeHelper: 'PDF, DOC, DOCX - حد أقصى 5 ميجابايت',
    profilePicture: 'الصورة الشخصية',
    iqamaNumber: 'رقم الإقامة',
    iqamaExpiry: 'تاريخ انتهاء الإقامة',
    kafeelNumber: 'رقم الكفيل',
    availableTimeSlots: 'الأوقات المتاحة',
    previous: 'السابق',
    next: 'التالي',
    submitApplication: 'إرسال الطلب',
    submittingApplication: 'جارٍ إرسال الطلب...',
    optional: 'اختياري',
    required: 'مطلوب'
  },
  en: {
    applyInMinutes: 'Apply in Minutes',
    landYourNext: 'Land Your Next',
    opportunity: 'Opportunity',
    simpleApplication: 'One simple application connects you with employers actively seeking talent. No complicated processes, no endless forms.',
    startApplication: 'Start Application',
    forEmployers: 'For Employers',
    applicationForm: 'Application Form',
    step: 'Step',
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    skillsExperience: 'Skills & Experience',
    documentsLegal: 'Documents & Legal Info',
    availability: 'Availability',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    nationality: 'Nationality',
    skills: 'Skills',
    experience: 'Experience',
    resume: 'Resume/CV',
    video: 'Introduction Video',
    uploadResumeOrVideo: 'Upload Resume or Video (or both)',
    videoHelper: 'Max 100MB - MP4, WebM, MOV (~2 minutes)',
    resumeHelper: 'PDF, DOC, DOCX - Max 5MB',
    profilePicture: 'Profile Picture',
    iqamaNumber: 'Iqama Number',
    iqamaExpiry: 'Iqama Expiry Date',
    kafeelNumber: 'Kafeel Number',
    availableTimeSlots: 'Available Time Slots',
    previous: 'Previous',
    next: 'Next',
    submitApplication: 'Submit Application',
    submittingApplication: 'Submitting Application...',
    optional: 'Optional',
    required: 'Required'
  }
};

export default function HomePage() {
  const { submitApplication, loading, error, success, clearError } = useEmployeeForm();
  const [applicationsAllowed, setApplicationsAllowed] = useState<boolean | null>(null);
  const [checkingSettings, setCheckingSettings] = useState(true);

  // Language state (default to English)
  const [language, setLanguage] = useState<'ar' | 'en'>('en');
  const t = translations[language];

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    nationality: '',
    skills: [] as string[],
    experience: '',
    iqamaNumber: '',
    iqamaExpiryDate: '',
    kafeelNumber: '',
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [availability, setAvailability] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if applications are allowed
  useEffect(() => {
    async function checkSettings() {
      try {
        const response = await fetch('/api/settings/public');
        if (response.ok) {
          const settings = await response.json();
          setApplicationsAllowed(settings.allowNewApplications ?? true);
        } else {
          setApplicationsAllowed(true); // Default to allowed on error
        }
      } catch (error) {
        console.error('Error checking settings:', error);
        setApplicationsAllowed(true); // Default to allowed on error
      } finally {
        setCheckingSettings(false);
      }
    }
    checkSettings();
  }, []);

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

  const handleVideoChange = (files: File[]) => {
    if (files.length > 0) {
      setVideoFile(files[0]);
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

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
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

      case 2: // Location & Nationality
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

        // Nationality validation
        if (!formData.nationality.trim()) {
          setValidationError('Please enter your nationality');
          return false;
        }
        if (formData.nationality.trim().length < 2) {
          setValidationError('Nationality must be at least 2 characters');
          return false;
        }
        if (formData.nationality.length > 100) {
          setValidationError('Nationality is too long (max 100 characters)');
          return false;
        }
        return true;

      case 3: // Professional Details
        // Skills validation (array format)
        if (!formData.skills || formData.skills.length === 0) {
          setValidationError('Please select at least one skill');
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
        if (!resumeFile && !videoFile) {
          setValidationError(t.uploadResumeOrVideo);
          return false;
        }

        // Iqama Number validation
        if (!formData.iqamaNumber.trim()) {
          setValidationError('Please enter your Iqama number');
          return false;
        }
        if (formData.iqamaNumber.trim().length < 10) {
          setValidationError('Iqama number must be at least 10 characters');
          return false;
        }

        // Iqama Expiry Date validation
        if (!formData.iqamaExpiryDate) {
          setValidationError('Please select your Iqama expiry date');
          return false;
        }

        // Kafeel Number validation
        if (!formData.kafeelNumber.trim()) {
          setValidationError('Please enter your Kafeel number');
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
      video: videoFile || undefined,
      profilePicture: profilePicture || undefined,
      availableTimeSlots: availability || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Language Toggle Button - Small, Floating */}
      <button
        onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        className="fixed top-24 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-brand-yellow/10 hover:bg-brand-yellow/20 border border-brand-yellow/30 rounded-lg text-brand-yellow text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm"
        aria-label="Toggle Language"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {language === 'ar' ? 'EN' : 'ع'}
      </button>

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
                <span className="text-xs sm:text-sm font-semibold text-brand-yellow">{t.applyInMinutes}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-brand-light mb-4 sm:mb-6 leading-tight">
                {t.landYourNext}{' '}
                <span className="text-gradient">{t.opportunity}</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                {t.simpleApplication}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#application-form">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    {t.startApplication}
                  </Button>
                </a>
                <Link href="/employers">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t.forEmployers}
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
            {/* Loading state while checking settings */}
            {checkingSettings ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-brand-light text-lg">Loading...</p>
              </div>
            ) : applicationsAllowed === false ? (
              /* Applications closed message */
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
                  Applications Currently Closed
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  We're not accepting new applications at this time.
                </p>
                <p className="text-gray-400">
                  Please check back later or contact support for more information.
                </p>
              </div>
            ) : (
              /* Normal form when applications are allowed */
              <>
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-light mb-2 sm:mb-3">
                    {t.applicationForm}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400">
                    {t.step} {currentStep} {language === 'ar' ? 'من' : 'of'} {totalSteps}
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
                  label={t.fullName}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' ? 'أحمد محمد' : 'John Doe'}
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
                    label={`${t.email} (${t.optional})`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'ahmed@example.com' : 'john@example.com'}
                    fullWidth
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />

                  <Input
                    label={t.phone}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+966 50 000 0000"
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

              {/* Step 2: Location & Nationality */}
              {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                <h3 className="text-base sm:text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-xs sm:text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  Location & Nationality
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Input
                    label={t.city}
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'الرياض' : 'Riyadh'}
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
                    label={t.nationality}
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'سعودي' : 'Saudi Arabian'}
                    required
                    fullWidth
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
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

                <SkillSelector
                  value={formData.skills}
                  onChange={handleSkillsChange}
                  disabled={loading}
                  required
                />

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
                  {t.documentsLegal}
                </h3>

                {/* At least one required message */}
                {!resumeFile && !videoFile && (
                  <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-3 text-sm text-brand-yellow flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t.uploadResumeOrVideo}</span>
                  </div>
                )}

                <FileUpload
                  label={`${t.resume} (${t.optional})`}
                  accept=".pdf,.doc,.docx"
                  maxSize={5}
                  onChange={handleResumeChange}
                  helperText={t.resumeHelper}
                />

                <FileUpload
                  label={`${t.video} (${t.optional})`}
                  accept=".mp4,.webm,.mov"
                  maxSize={100}
                  onChange={handleVideoChange}
                  helperText={t.videoHelper}
                />

                <FileUpload
                  label={`${t.profilePicture} (${t.optional})`}
                  accept=".jpg,.jpeg,.png"
                  maxSize={2}
                  onChange={handleProfilePictureChange}
                  helperText="JPG, PNG - Max 2MB"
                />

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm sm:text-base font-medium text-brand-light mb-4">
                    Document Information
                  </h4>

                  <div className="space-y-4">
                    <Input
                      label="Iqama Number"
                      name="iqamaNumber"
                      type="text"
                      value={formData.iqamaNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your Iqama number"
                      required
                    />

                    <Input
                      label="Iqama Expiry Date"
                      name="iqamaExpiryDate"
                      type="date"
                      value={formData.iqamaExpiryDate}
                      onChange={handleInputChange}
                      required
                    />

                    <Input
                      label="Kafeel Number"
                      name="kafeelNumber"
                      type="text"
                      value={formData.kafeelNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your Kafeel number"
                      required
                    />
                  </div>
                </div>
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
                    {language === 'ar' ? (
                      <>
                        {t.previous}
                        <svg className="w-5 h-5 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t.previous}
                      </>
                    )}
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
                    {language === 'ar' ? (
                      <>
                        <svg className="w-5 h-5 ml-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {t.next}
                      </>
                    ) : (
                      <>
                        {t.next}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="flex-1"
                  >
                    <span className="hidden sm:inline">{loading ? t.submittingApplication : t.submitApplication}</span>
                    <span className="sm:hidden">{loading ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...') : (language === 'ar' ? 'إرسال' : 'Submit')}</span>
                  </Button>
                )}
              </div>
            </form>
              </>
            )}
          </div>

          {/* Employer CTA */}
          <div className="mt-8 sm:mt-10 lg:mt-12 text-center animate-fade-in">
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">Are you an employer looking for talent?</p>
            <Link href="/employers">
              <Button variant="outline" size="md">
                <span className="hidden sm:inline">Learn More →</span>
                <span className="sm:hidden">Learn More</span>
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
