'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Navbar } from '@/components';

// Translations
const translations = {
  ar: {
    registerAsEmployer: 'التسجيل كصاحب عمل',
    createAccount: 'أنشئ حسابًا لنشر الوظائف والعثور على أفضل المواهب',
    companyInfo: 'معلومات الشركة',
    companyName: 'اسم الشركة',
    contactPerson: 'الشخص المسؤول',
    phone: 'رقم الهاتف',
    industry: 'المجال',
    selectIndustry: 'اختر المجال',
    companySize: 'حجم الشركة',
    selectSize: 'اختر الحجم',
    companyWebsite: 'موقع الشركة الإلكتروني',
    optional: 'اختياري',
    accountInfo: 'معلومات الحساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    commercialRegistration: 'السجل التجاري',
    crNumber: 'رقم السجل التجاري',
    crDocument: 'وثيقة السجل التجاري',
    uploadDocument: 'رفع الوثيقة',
    register: 'تسجيل',
    registering: 'جارٍ التسجيل...',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    registrationsClosed: 'التسجيل مغلق حاليًا',
    notAcceptingRegistrations: 'لا نقبل تسجيلات أصحاب عمل جدد في الوقت الحالي.',
    checkBackLater: 'يرجى المحاولة لاحقًا أو التواصل مع الدعم للحصول على مزيد من المعلومات.',
    loading: 'جارٍ التحميل...',
    required: 'مطلوب',
    minCharacters: 'الحد الأدنى 8 أحرف',
    reEnterPassword: 'أعد إدخال كلمة المرور',
    passwordRequirements: 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، رمز خاص',
    companyNamePlaceholder: 'شركة الأمثل',
    contactPersonPlaceholder: 'أحمد محمد',
    websiteOptional: 'الموقع الإلكتروني (اختياري)',
    websitePlaceholder: 'https://company.com',
    crNumberPlaceholder: 'مثال: 1234567890',
    crDocumentHelper: 'ارفع صورة واضحة أو ملف PDF للسجل التجاري (الحد الأقصى 5 ميجابايت)',
    uploadingCr: 'جارٍ رفع وثيقة السجل التجاري...',
    creatingAccount: 'جارٍ إنشاء الحساب...',
    createEmployerAccount: 'إنشاء حساب صاحب عمل',
    loginHere: 'سجل دخول من هنا',
    lookingForJob: 'تبحث عن وظيفة؟',
    backToApplications: '← العودة إلى طلبات التوظيف',
    // Industry options
    restaurant: 'مطعم',
    cafe: 'مقهى',
    cafeAndBakery: 'مقهى ومخبز',
    bakery: 'مخبز',
    // Company size options
    employees1_10: '1-10 موظفين',
    employees11_50: '11-50 موظفًا',
    employees51_200: '51-200 موظف',
    employees201_500: '201-500 موظف',
    employees501_1000: '501-1000 موظف',
    employees1000plus: '1000+ موظف',
  },
  en: {
    registerAsEmployer: 'Register as Employer',
    createAccount: 'Create an account to post jobs and find top talent',
    companyInfo: 'Company Information',
    companyName: 'Company Name',
    contactPerson: 'Contact Person',
    phone: 'Phone Number',
    industry: 'Industry',
    selectIndustry: 'Select industry',
    companySize: 'Company Size',
    selectSize: 'Select size',
    companyWebsite: 'Company Website',
    optional: 'Optional',
    accountInfo: 'Account Information',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    commercialRegistration: 'Commercial Registration',
    crNumber: 'CR Number',
    crDocument: 'CR Document',
    uploadDocument: 'Upload Document',
    register: 'Register',
    registering: 'Registering...',
    alreadyHaveAccount: 'Already have an account?',
    login: 'Login',
    registrationsClosed: 'Registrations Currently Closed',
    notAcceptingRegistrations: "We're not accepting new employer registrations at this time.",
    checkBackLater: 'Please check back later or contact support for more information.',
    loading: 'Loading...',
    required: 'Required',
    minCharacters: 'Min. 8 characters',
    reEnterPassword: 'Re-enter password',
    passwordRequirements: 'Must include: uppercase, lowercase, number, special character',
    companyNamePlaceholder: 'Acme Corporation',
    contactPersonPlaceholder: 'John Doe',
    websiteOptional: 'Website (Optional)',
    websitePlaceholder: 'https://company.com',
    crNumberPlaceholder: 'e.g., 1234567890',
    crDocumentHelper: 'Upload a clear image or PDF of your Commercial Registration (Max 5MB)',
    uploadingCr: 'Uploading CR Document...',
    creatingAccount: 'Creating Account...',
    createEmployerAccount: 'Create Employer Account',
    loginHere: 'Login here',
    lookingForJob: 'Looking for a job?',
    backToApplications: '← Back to Job Applications',
    // Industry options
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    cafeAndBakery: 'Cafe and Bakery',
    bakery: 'Bakery',
    // Company size options
    employees1_10: '1-10 employees',
    employees11_50: '11-50 employees',
    employees51_200: '51-200 employees',
    employees201_500: '201-500 employees',
    employees501_1000: '501-1000 employees',
    employees1000plus: '1000+ employees',
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationsAllowed, setRegistrationsAllowed] = useState<boolean | null>(null);
  const [checkingSettings, setCheckingSettings] = useState(true);

  // Language state (default to Arabic)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const t = translations[language];

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
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
      setUploadingCr(false);
    }
  };

  // If registration was successful, show success screen
  if (successMessage) {
    return (
      <div className="min-h-screen bg-brand-dark font-arabic" dir="rtl">
        <Navbar />

        <div className="flex items-center justify-center px-4 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          <div className="max-w-3xl w-full relative z-10">
            {/* Success Icon */}
            <div className="text-center mb-8 animate-bounce-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-yellow rounded-full mb-6 shadow-yellow-glow-lg">
                <svg
                  className="w-12 h-12 text-brand-dark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-brand-light mb-3">
                تم استلام طلبك بنجاح!
              </h1>

              <p className="text-lg sm:text-xl text-gray-400">
                سيتم مراجعة حسابك قريبًا
              </p>
            </div>

            {/* Confirmation Card */}
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-dark-elevation mb-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-green/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-brand-light">تأكيد التسجيل</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-400">تم استلام البيانات</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-400">تم رفع السجل التجاري</span>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-dark-elevation mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-semibold text-brand-light mb-6 flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                ماذا سيحدث الآن؟
              </h2>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-light mb-1 text-base">مراجعة الطلب</h3>
                    <p className="text-gray-400 text-sm">
                      سيقوم فريقنا بمراجعة بياناتك والتأكد من صحة السجل التجاري
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-light mb-1 text-base">الموافقة والتفعيل</h3>
                    <p className="text-gray-400 text-sm">
                      بعد الموافقة، ستتمكن من تسجيل الدخول والوصول إلى لوحة التحكم الخاصة بك
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-light mb-1 text-base">البدء في التوظيف</h3>
                    <p className="text-gray-400 text-sm">
                      تصفح السير الذاتية للمتقدمين واختر الموظفين المناسبين لمنشأتك
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Reminder */}
            <div className="p-5 sm:p-6 bg-accent-orange/10 rounded-xl border border-accent-orange/30 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-accent-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-accent-orange font-semibold mb-2 text-sm sm:text-base">ملاحظات هامة</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">⏱️</span>
                      <span>عادةً ما تستغرق عملية المراجعة من 1-2 يوم عمل</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">📧</span>
                      <span>سيتم إرسال إشعار إلى بريدك الإلكتروني: <span className="font-medium text-brand-yellow">{formData.email}</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">📞</span>
                      <span>قد نتواصل معك على رقم: <span className="font-medium text-brand-yellow">{formData.phone}</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">🔒</span>
                      <span>لن تتمكن من تسجيل الدخول حتى تتم الموافقة على حسابك</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link href="/login" className="block">
                <Button variant="primary" size="lg" fullWidth>
                  الذهاب إلى صفحة تسجيل الدخول
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button variant="outline" size="lg" fullWidth>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  العودة للصفحة الرئيسية
                </Button>
              </Link>
            </div>

            {/* Good Luck Message */}
            <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
              <p className="text-lg text-brand-yellow font-semibold">
                شكراً لاختياركم منصتنا! 🎉
              </p>
              <p className="text-sm text-gray-500 mt-2">
                نحن متحمسون لمساعدتك في العثور على أفضل الكفاءات
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-slide-down">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-light mb-4">
              {language === 'ar' ? (
                <>{t.registerAsEmployer}</>
              ) : (
                <>Register as <span className="text-gradient">Employer</span></>
              )}
            </h1>
            <p className="text-gray-400 text-lg">
              {t.createAccount}
            </p>
          </div>

          {/* Registration Form */}
          <div className="glass rounded-2xl p-8 md:p-10 shadow-dark-elevation animate-slide-up">
            {/* Loading state while checking settings */}
            {checkingSettings ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-brand-light text-lg">{t.loading}</p>
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
                  {t.registrationsClosed}
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  {t.notAcceptingRegistrations}
                </p>
                <p className="text-gray-400 mb-6">
                  {t.checkBackLater}
                </p>
                <Link href="/login">
                  <Button variant="outline" size="md">
                    {t.alreadyHaveAccount} {t.login}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
                  <span className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark text-sm font-bold">
                    1
                  </span>
                  {t.accountInfo}
                </h3>

                <div>
                  <Input
                    label={t.email}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={language === 'ar' ? 'company@example.com' : 'company@example.com'}
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
                      label={t.password}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t.minCharacters}
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
                      {t.passwordRequirements}
                    </p>
                  </div>

                  <div>
                    <Input
                      label={t.confirmPassword}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t.reEnterPassword}
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
                  {t.companyInfo}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t.companyName}
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder={t.companyNamePlaceholder}
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
                    label={t.contactPerson}
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder={t.contactPersonPlaceholder}
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
                    label={t.phone}
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
                      {t.industry} <span className="text-brand-yellow">*</span>
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow hover:border-brand-yellow/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{t.selectIndustry}</option>
                      <option value="Restaurant">{t.restaurant}</option>
                      <option value="Cafe">{t.cafe}</option>
                      <option value="Cafe and Bakery">{t.cafeAndBakery}</option>
                      <option value="Bakery">{t.bakery}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-light mb-2">
                      {t.companySize} <span className="text-brand-yellow">*</span>
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow hover:border-brand-yellow/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{t.selectSize}</option>
                      <option value="1-10">{t.employees1_10}</option>
                      <option value="11-50">{t.employees11_50}</option>
                      <option value="51-200">{t.employees51_200}</option>
                      <option value="201-500">{t.employees201_500}</option>
                      <option value="501-1000">{t.employees501_1000}</option>
                      <option value="1000+">{t.employees1000plus}</option>
                    </select>
                  </div>

                  <Input
                    label={t.websiteOptional}
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder={t.websitePlaceholder}
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
                    {t.commercialRegistration}
                  </h3>

                  <div className="space-y-4">
                    <Input
                      label={t.crNumber}
                      type="text"
                      name="commercialRegistrationNumber"
                      value={formData.commercialRegistrationNumber}
                      onChange={handleChange}
                      placeholder={t.crNumberPlaceholder}
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
                        {t.crDocument} <span className="text-brand-yellow">*</span>
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        {t.crDocumentHelper}
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
                  {uploadingCr ? t.uploadingCr : loading ? t.creatingAccount : t.createEmployerAccount}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  {t.alreadyHaveAccount}{' '}
                  <Link href="/login" className="text-brand-yellow hover:text-brand-yellow/80 font-semibold transition-colors">
                    {t.loginHere}
                  </Link>
                </p>
              </div>
            </form>
              </>
            )}
          </div>

          {/* Employee Link */}
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-gray-400 mb-4">{t.lookingForJob}</p>
            <Link href="/">
              <Button variant="outline" size="md">
                {t.backToApplications}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
