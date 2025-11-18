'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Navbar } from '@/components';

export default function EmployersPage() {
  const [currentBenefit, setCurrentBenefit] = useState(0);

  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'الوصول إلى مواهب مؤهلة',
      description: 'تصفح المرشحين المعتمدين مع ملفات تعريف كاملة ومهارات وخبرات',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'جدولة سلسة',
      description: 'تكامل مع تقويم جوجل لإدارة المقابلات بسهولة',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'عملية توظيف سريعة',
      description: 'قلل وقت التوظيف من خلال مراجعة الطلبات المبسطة والتواصل المباشر',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'آمن وموثوق',
      description: 'أمان على مستوى المؤسسات مع دعم مخصص لاحتياجات التوظيف الخاصة بك',
    },
  ];

  const nextBenefit = () => {
    setCurrentBenefit((prev) => (prev + 1) % benefits.length);
  };

  const prevBenefit = () => {
    setCurrentBenefit((prev) => (prev - 1 + benefits.length) % benefits.length);
  };

  return (
    <div className="min-h-screen bg-brand-dark font-arabic" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-28 px-3 sm:px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-96 h-96 sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-to-br from-brand-yellow/15 via-brand-yellow/5 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-gradient-to-tl from-brand-yellow/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Right: Hero Content */}
            <div className="text-center lg:text-right animate-slide-down">
              <div className="inline-block mb-6 px-5 py-2.5 bg-brand-yellow/10 border border-brand-yellow/30 rounded-full">
                <span className="text-sm font-bold text-brand-yellow">لأصحاب العمل</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-light mb-6 leading-tight">
                موظفك جاهز..{' '}
                <span className="text-gradient">إنقل كفالته!</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                تبحث عن موظف لمطعمك أو مقهاك؟
موظفين بخبرة، قد اشتغلوا قبل في القطاع، جاهزين للعمل مباشرة، وينقصهم فقط نقل الإقامة إلى منشأتك.
مع منصتنا… تختار، تتواصل، وتوظّف خلال أيام.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    ابدأ الآن
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    شاهد كيف يعمل
                  </Button>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-6">
                <div className="text-center lg:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-brand-yellow mb-1">500+</div>
                  <div className="text-xs sm:text-sm text-gray-400">مرشح نشط</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-brand-yellow mb-1">95%</div>
                  <div className="text-xs sm:text-sm text-gray-400">نجاح المطابقة</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-brand-yellow mb-1">48</div>
                  <div className="text-xs sm:text-sm text-gray-400">ساعة متوسط</div>
                </div>
              </div>
            </div>

            {/* Left: Dashboard Preview */}
            <div className="relative animate-fade-in hidden lg:block lg:order-first">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/30 to-transparent rounded-3xl blur-3xl"></div>

                {/* Main Dashboard Card */}
                <div className="relative glass rounded-2xl p-8 shadow-2xl">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-yellow rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-brand-light">لوحة التوظيف</div>
                        <div className="text-xs text-gray-400">إدارة المرشحين والمقابلات</div>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-accent-green animate-pulse"></div>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-dark-400/50 rounded-xl p-4 hover:bg-dark-400 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-brand-yellow/20"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-dark-300 rounded-full w-3/4 mb-2"></div>
                            <div className="h-2 bg-dark-300/50 rounded-full w-1/2"></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-7 bg-brand-yellow/20 rounded-lg flex-1"></div>
                          <div className="h-7 bg-dark-300/30 rounded-lg w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -top-4 -left-4 glass rounded-xl px-4 py-3 animate-bounce-in shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                    <span className="text-sm font-semibold text-brand-light">3 مرشحين جدد</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Carousel */}
      <section className="py-12 sm:py-16 px-3 sm:px-4 bg-gradient-to-b from-transparent to-dark-400/30">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-6 sm:p-8 lg:p-12">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <button
                onClick={nextBenefit}
                className="p-2 sm:p-3 rounded-full bg-dark-400 hover:bg-brand-yellow/10 text-brand-light hover:text-brand-yellow transition-all flex-shrink-0"
                aria-label="الميزة التالية"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex-1 px-2 sm:px-4 lg:px-8 text-center animate-fade-in" key={currentBenefit}>
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-brand-yellow/10 rounded-2xl mb-4 sm:mb-6 text-brand-yellow">
                  {benefits[currentBenefit].icon}
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-light mb-3 sm:mb-4">
                  {benefits[currentBenefit].title}
                </h3>
                <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
                  {benefits[currentBenefit].description}
                </p>
              </div>

              <button
                onClick={prevBenefit}
                className="p-2 sm:p-3 rounded-full bg-dark-400 hover:bg-brand-yellow/10 text-brand-light hover:text-brand-yellow transition-all flex-shrink-0"
                aria-label="الميزة السابقة"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {benefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBenefit(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentBenefit ? 'w-8 bg-brand-yellow' : 'w-2 bg-dark-300'
                  }`}
                  aria-label={`انتقل إلى الميزة ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 bg-dark-400/20">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-20 lg:space-y-24">
          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="animate-slide-right order-2 lg:order-1">
              <div className="relative animate-fade-in">
                <div className="glass rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-dark-400/50 rounded-xl p-5 hover:bg-dark-400 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-yellow/30 to-brand-yellow/10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-dark-300 rounded-full w-3/4"></div>
                          <div className="h-3 bg-dark-300/50 rounded-full w-1/2"></div>
                          <div className="flex gap-2 mt-3">
                            <div className="h-6 bg-brand-yellow/20 rounded-full px-3 w-20"></div>
                            <div className="h-6 bg-brand-yellow/20 rounded-full px-3 w-24"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-slide-left order-1 lg:order-2">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-yellow/10 rounded-full mb-3 sm:mb-4">
                <span className="text-xs font-bold text-brand-yellow uppercase">مطابقة ذكية</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-light mb-4 sm:mb-6">
                تصفح المرشحين المؤهلين مع ملفات تعريف تفصيلية
              </h3>
              <p className="text-base sm:text-lg text-gray-400 mb-6 leading-relaxed">
                الوصول إلى ملفات تعريف شاملة للمرشحين بما في ذلك المهارات والخبرة والتعليم والسير الذاتية المحملة. قم بالتصفية والبحث للعثور على المطابقة المثالية لوظائفك المفتوحة.
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {['معلومات الملف الشخصي الكاملة', 'التحقق من المهارات والخبرات', 'الوصول إلى السيرة الذاتية والمستندات', 'خيارات تصفية متقدمة'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-brand-light">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant="primary" size="lg">
                  ابدأ تصفح المرشحين
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="relative animate-fade-in order-2 lg:order-2">
              <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8">
                <div className="bg-dark-400/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-accent-green/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-brand-light">تم جدولة المقابلة</div>
                      <div className="text-xs text-accent-green">تم إنشاء رابط Google Meet</div>
                    </div>
                  </div>
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-dark-300/30 rounded-lg">
                      <div className="w-10 h-10 bg-brand-yellow/20 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-dark-300 rounded-full w-2/3"></div>
                        <div className="h-2 bg-dark-300/50 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-slide-left order-1 lg:order-1">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-yellow/10 rounded-full mb-3 sm:mb-4">
                <span className="text-xs font-bold text-brand-yellow uppercase">جدولة سلسة</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-light mb-4 sm:mb-6">
                جدولة المقابلات مع تقويم جوجل المتكامل
              </h3>
              <p className="text-base sm:text-lg text-gray-400 mb-6 leading-relaxed">
                قل وداعًا لسلاسل البريد الإلكتروني التي لا تنتهي. جدول المقابلات مباشرة من خلال المنصة مع إنشاء روابط Google Meet تلقائيًا وإرسال دعوات التقويم إلى الطرفين.
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {['تكامل تقويم جوجل بنقرة واحدة', 'روابط Google Meet تلقائية', 'إشعارات البريد الإلكتروني للمرشحين', 'تتبع توافر المقابلات'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-brand-light">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant="primary" size="lg">
                  جرب جدولة المقابلات
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="relative animate-fade-in order-2 lg:order-1">
              <div className="glass rounded-2xl p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'قيد الانتظار', count: '12', color: 'yellow' },
                    { label: 'مجدولة', count: '5', color: 'green' },
                    { label: 'مكتملة', count: '23', color: 'blue' },
                    { label: 'الإجمالي', count: '40', color: 'purple' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-dark-400/50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-brand-yellow mb-1">{stat.count}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-dark-400/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-yellow/20"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-dark-300 rounded-full w-24"></div>
                          <div className="h-2 bg-dark-300/50 rounded-full w-16"></div>
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-accent-green/20 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-slide-right order-1 lg:order-2">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-yellow/10 rounded-full mb-3 sm:mb-4">
                <span className="text-xs font-bold text-brand-yellow uppercase">إدارة فعالة</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-light mb-4 sm:mb-6">
                إدارة المرشحين من لوحة تحكم واحدة
              </h3>
              <p className="text-base sm:text-lg text-gray-400 mb-6 leading-relaxed">
                تتبع جميع المرشحين وجدول المقابلات والتواصل معهم من لوحة تحكم مركزية واحدة. ابق منظمًا ولا تفوت أي فرصة توظيف.
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {['إدارة مركزية للمرشحين', 'تحديثات الحالة في الوقت الفعلي', 'تتبع سجل المقابلات', 'مقارنة سريعة للمرشحين'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-brand-light">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant="primary" size="lg">
                  الوصول إلى لوحة التحكم
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-light mb-4">
              ابدأ في <span className="text-gradient">3 خطوات بسيطة</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              ابدأ في توظيف المرشحين المؤهلين في دقائق من خلال عمليتنا المبسطة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'أنشئ حسابك',
                description: 'سجل وأكمل ملف شركتك في أقل من دقيقتين. أخبرنا عن مؤسستك واحتياجات التوظيف.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'تصفح وتواصل',
                description: 'ابحث من خلال المرشحين المؤهلين، راجع الملفات التفصيلية، واطلب المقابلات مع المرشحين الذين يتناسبون مع متطلباتك.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'جدولة المقابلات',
                description: 'استخدم تقويم جوجل المتكامل لجدولة المقابلات. يتم إرسال روابط الاجتماعات التلقائية ودعوات البريد الإلكتروني إلى كلا الطرفين.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative glass rounded-2xl p-6 sm:p-8 hover:scale-105 transition-transform duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 bg-brand-yellow rounded-xl sm:rounded-2xl flex items-center justify-center shadow-yellow-glow">
                  <span className="text-brand-dark font-bold text-lg sm:text-xl">{item.step}</span>
                </div>

                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow mb-4 sm:mb-6">
                  {item.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-brand-light mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{item.description}</p>

                {/* Connector line (not on last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -left-4 w-8 h-0.5 bg-gradient-to-l from-brand-yellow/50 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-brand-yellow via-yellow-400 to-brand-yellow relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #101820 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-4 sm:mb-6 leading-tight px-2">
            هل أنت مستعد لتحويل عملية التوظيف؟
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-brand-dark/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            انضم إلى مئات أصحاب العمل الذين يعثرون على أفضل المواهب من خلال منصتنا. أنشئ حسابك المجاني اليوم وانشر وظيفتك الأولى.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-black border-black hover:bg-black/10 w-full sm:w-auto font-bold"
              >
                ابدأ مجانًا
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-black border-black hover:bg-black/10 w-full sm:w-auto font-bold"
              >
                عرض بوابة المرشحين
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-3 sm:px-4 border-t border-dark-300 bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-brand-yellow rounded-lg flex items-center justify-center">
                  <span className="text-brand-dark font-bold text-xl">J</span>
                </div>
                <span className="text-brand-light font-bold text-xl">
                  منصة<span className="text-brand-yellow">التوظيف</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                ربط الباحثين عن عمل الموهوبين مع أصحاب العمل ذوي التفكير المستقبلي. قم بتبسيط عملية التوظيف الخاصة بك باستخدام منصة التوظيف الحديثة.
              </p>
            </div>

            <div>
              <h3 className="text-brand-light font-semibold mb-4">لأصحاب العمل</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-400 hover:text-brand-yellow transition-colors">تسجيل الدخول</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-brand-yellow transition-colors">التسجيل</Link></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-brand-yellow transition-colors">كيف يعمل</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-brand-light font-semibold mb-4">للباحثين عن عمل</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-brand-yellow transition-colors">قدم الآن</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-brand-yellow transition-colors">تصفح الوظائف</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-300 pt-8 text-center">
            <p className="text-sm text-gray-400">&copy; 2025 منصة التوظيف. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
