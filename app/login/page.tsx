'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components';
import { useLogin } from '@/features/auth/useAuth';

export default function LoginPage() {
  const { login, loading, error, clearError } = useLogin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark animated-bg px-4 py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-yellow/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-slide-down">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-brand-yellow rounded-2xl mx-auto mb-4 flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300">
              <span className="text-brand-dark font-bold text-3xl">R</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-brand-light mb-2">
            Employer Login
          </h1>
          <p className="text-gray-400">
            Access your recruitment dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 shadow-dark-elevation animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-accent-red/10 border border-accent-red/50 rounded-lg p-4 animate-slide-down">
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
                  <p className="text-sm text-accent-red">{error.message}</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employer@company.com"
              required
              fullWidth
              variant="default"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              fullWidth
              variant="default"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-brand-dark text-gray-400">
                New employer?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link href="/register">
            <Button variant="outline" size="lg" fullWidth>
              Create Account
            </Button>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6 animate-fade-in">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-brand-yellow transition-colors duration-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
