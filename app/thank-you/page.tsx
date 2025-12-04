'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Navbar } from '@/components';

interface SubmissionData {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  education: string;
  skills: string;
  hasAvailability: boolean;
  timestamp: string;
}

export default function ThankYouPage() {
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Retrieve submission data from sessionStorage
    const data = sessionStorage.getItem('submissionData');
    if (data) {
      setSubmissionData(JSON.parse(data));
      // Clear after reading to avoid stale data
      sessionStorage.removeItem('submissionData');
    }
  }, []);

  const firstName = submissionData?.fullName.split(' ')[0] || 'there';
  const topSkills = submissionData?.skills.split(',').slice(0, 3).map(s => s.trim()).join(', ') || submissionData?.skills.substring(0, 50);

  const handleShare = () => {
    const shareUrl = window.location.origin;
    const shareText = 'Found a great job application platform! Apply in minutes.';

    if (navigator.share) {
      navigator.share({
        title: 'Ready HR',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // Fallback to copy
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Success Icon with Confetti Effect */}
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
            You&apos;re All Set, {firstName}!
          </h1>

          <p className="text-lg sm:text-xl text-gray-400">
            We&apos;ve received your application
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
            <h2 className="text-xl font-semibold text-brand-light">Confirmation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-400">Application received</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-400">Resume uploaded</span>
            </div>
            {submissionData?.hasAvailability && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-400">Availability shared</span>
              </div>
            )}
          </div>
        </div>

        {/* What You Submitted */}
        {submissionData && (
          <div className="glass rounded-2xl p-6 sm:p-8 shadow-dark-elevation mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-brand-light mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              What You Submitted
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">📍 City</p>
                <p className="text-brand-light font-medium">{submissionData.city}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">🎓 Education</p>
                <p className="text-brand-light font-medium">{submissionData.education}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 mb-1">💼 Top Skills</p>
                <p className="text-brand-light font-medium">{topSkills}</p>
              </div>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="glass rounded-2xl p-6 sm:p-8 shadow-dark-elevation mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-semibold text-brand-light mb-6 flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            What Happens Next?
          </h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-brand-light mb-1 text-base">Employers Review Your Profile</h3>
                <p className="text-gray-400 text-sm">
                  Employers will review your application based on their current hiring needs
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-brand-light mb-1 text-base">You&apos;ll Get Contacted</h3>
                <p className="text-gray-400 text-sm">
                  If there&apos;s a match, employers will reach out via email or phone within 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Reminder */}
        <div className="p-5 sm:p-6 bg-accent-orange/10 rounded-xl border border-accent-orange/30 mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-accent-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-accent-orange font-semibold mb-2 text-sm sm:text-base">Important Reminders</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Answer calls from unknown numbers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>Check your spam/junk folder for emails</span>
                </li>
                {submissionData?.email && (
                  <li className="flex items-center gap-2">
                    <span>✉️</span>
                    <span>We&apos;ll email you at: <span className="font-medium text-brand-yellow">{submissionData.email}</span></span>
                  </li>
                )}
                {submissionData?.phone && (
                  <li className="flex items-center gap-2">
                    <span>📞</span>
                    <span>Be ready for calls to: <span className="font-medium text-brand-yellow">{submissionData.phone}</span></span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          {/* Share with Friends */}
          <div className="glass rounded-xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-brand-light font-semibold mb-1 text-base sm:text-lg">
                  Know someone looking for a job?
                </h3>
                <p className="text-gray-400 text-sm">
                  Help them get started with their application
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleShare}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Link Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Back to Home */}
          <Link href="/" className="block">
            <Button variant="outline" size="lg" fullWidth>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Good Luck Message */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          <p className="text-lg text-brand-yellow font-semibold">
            Good luck! 🍀
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your next career opportunity is just a phone call away
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
