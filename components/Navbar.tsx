'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from './Button';

export interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated = false, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // Only close if menu is open to avoid unnecessary re-renders
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${
          isScrolled
            ? 'bg-brand-dark/95 backdrop-blur-lg border-b border-brand-yellow/20 shadow-dark-elevation'
            : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={isAuthenticated ? "/employer/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-brand-yellow rounded-lg flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-brand-dark font-bold text-xl">J</span>
            </div>
            <span className="text-brand-light font-display font-bold text-xl hidden sm:inline-block">
              Job<span className="text-brand-yellow">Platform</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Link
                href={isAuthenticated ? "/employer/dashboard" : "/"}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-300
                  ${
                    isActive(isAuthenticated ? '/employer/dashboard' : '/')
                      ? 'text-brand-yellow bg-brand-yellow/10'
                      : 'text-brand-light hover:text-brand-yellow hover:bg-dark-400'
                  }
                `}
              >
                {isAuthenticated ? 'Dashboard' : 'Home'}
              </Link>

            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="primary"
                  size="sm"
                >
                  Employer Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-brand-light hover:bg-dark-400 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden overflow-hidden
          transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? 'max-h-screen opacity-100'
              : 'max-h-0 opacity-0'
          }
        `}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-brand-dark/95 backdrop-blur-lg border-t border-brand-yellow/10">
          <Link
            href={isAuthenticated ? "/employer/dashboard" : "/"}
            className={`
              block px-4 py-3 rounded-lg font-medium
              transition-all duration-300
              ${
                isActive(isAuthenticated ? '/employer/dashboard' : '/')
                  ? 'text-brand-yellow bg-brand-yellow/10'
                  : 'text-brand-light hover:text-brand-yellow hover:bg-dark-400'
              }
            `}
          >
            {isAuthenticated ? 'Dashboard' : 'Home'}
          </Link>

          <div className="pt-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={onLogout}
              >
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Employer Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;