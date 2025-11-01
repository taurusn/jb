'use client';

import Link from 'next/link';
import { Button } from '@/components';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark animated-bg px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Success Icon */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-yellow rounded-full mb-6 animate-glow">
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
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-light mb-4">
            Application Submitted!
          </h1>
          
          <p className="text-xl text-gray-400 mb-2">
            Thank you for applying
          </p>
          
          <div className="inline-flex items-center gap-2 text-brand-yellow">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Processing your application...</span>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass rounded-2xl p-8 md:p-10 shadow-dark-elevation mb-8 animate-slide-up">
          <h2 className="text-2xl font-semibold text-brand-light mb-6 flex items-center gap-3">
            <span className="text-3xl">📧</span>
            What Happens Next?
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-brand-light mb-1">Application Review</h3>
                <p className="text-gray-400 text-sm">
                  Our system will match your profile with relevant employers looking for your skills
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-brand-light mb-1">Employer Matching</h3>
                <p className="text-gray-400 text-sm">
                  Interested employers will review your application and may request to connect
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-brand-light mb-1">Direct Contact</h3>
                <p className="text-gray-400 text-sm">
                  You&apos;ll receive an email or phone call from employers interested in your profile
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-brand-yellow/10 rounded-lg border border-brand-yellow/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-brand-light font-medium mb-1">Keep Your Phone Ready!</p>
                <p className="text-gray-400">
                  Employers may contact you within 24-48 hours. Make sure to check your email and phone regularly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <Link href="/" className="flex-1">
            <Button variant="primary" size="lg" fullWidth>
              ← Back to Home
            </Button>
          </Link>
          
          <Link href="/" className="flex-1">
            <Button variant="outline" size="lg" fullWidth>
              Submit Another Application
            </Button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-gray-500 text-sm mb-4">Join thousands of professionals who found their dream job</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-yellow">1,000+</div>
              <div className="text-xs text-gray-500">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-yellow">50+</div>
              <div className="text-xs text-gray-500">Active Employers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-yellow">85%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
