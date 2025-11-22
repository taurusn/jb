'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminNavbar() {
  // Admin navigation with pending employer approvals
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/adminofjb/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { href: '/adminofjb/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/adminofjb/employers/pending', label: 'Pending Approvals', icon: '⏳' },
    { href: '/adminofjb/interviews', label: 'Interviews', icon: '📅' },
    { href: '/adminofjb/requests', label: 'Requests', icon: '📋' },
    { href: '/adminofjb/candidates', label: 'Candidates', icon: '👥' },
    { href: '/adminofjb/employers', label: 'Employers', icon: '🏢' },
    { href: '/adminofjb/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#101820]/90 border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/adminofjb/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEE715] to-[#FEE715]/70 flex items-center justify-center shadow-lg shadow-[#FEE715]/20 group-hover:shadow-[#FEE715]/40 transition-all group-hover:scale-110">
              <span className="text-[#101820] font-bold text-lg">🛡️</span>
            </div>
            <div>
              <h1 className="text-[#FEE715] font-bold text-lg group-hover:text-[#FEE715]/90 transition-colors">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">Job Platform</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FEE715] to-[#FEE715]/90 text-[#101820] shadow-lg shadow-[#FEE715]/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className={`text-lg ${isActive ? 'animate-bounce-subtle' : ''}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="group relative px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="absolute inset-0 bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {loading ? 'Logging out...' : (
                  <>
                    Logout
                    <span className="text-lg group-hover:translate-x-1 transition-transform">
                      🚪
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#101820]/95 backdrop-blur-xl animate-slideDown">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FEE715] to-[#FEE715]/90 text-[#101820]'
                        : 'text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold transition-all duration-300 border border-red-500/30 disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout 🚪'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
}
