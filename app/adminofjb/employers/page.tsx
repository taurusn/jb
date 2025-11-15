'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactCard } from '@/components/admin';

interface Employer {
  id: string;
  user: {
    email: string;
    role: string;
    createdAt: string;
  };
  profile: {
    companyName: string;
    contactName: string;
    phoneNumber: string;
    industry: string;
  } | null;
  _count: {
    requests: number;
  };
}

export default function EmployersPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'requests'>('date');

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      const response = await fetch('/api/adminofjb/employers');
      if (response.ok) {
        const data = await response.json();
        setEmployers(data.employers);
      } else {
        setError('Failed to fetch employers');
      }
    } catch (err) {
      setError('An error occurred while fetching employers');
    } finally {
      setLoading(false);
    }
  };

  // Get unique industries for filter
  const industries = Array.from(
    new Set(employers.map((e) => e.profile?.industry).filter(Boolean))
  ).sort() as string[];

  const filteredEmployers = employers
    .filter((employer) => {
      const matchesSearch =
        employer.profile?.companyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employer.profile?.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        industryFilter === 'ALL' || employer.profile?.industry === industryFilter;

      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return (
          new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime()
        );
      } else if (sortBy === 'name') {
        return (
          a.profile?.companyName?.localeCompare(b.profile?.companyName || '') || 0
        );
      } else {
        return b._count.requests - a._count.requests;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading employers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchEmployers}
            className="px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/10 via-transparent to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FEE715] to-[#FEE715]/70 flex items-center justify-center shadow-lg">
                <span className="text-3xl">🏢</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Employers</h1>
                <p className="text-gray-400">Manage all registered employers</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Employers</p>
              <p className="text-3xl font-bold text-[#FEE715]">{employers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, contact name, or email..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Industry
            </label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
            >
              <option value="ALL">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort & Clear */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Sort by:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'date'
                  ? 'bg-[#FEE715] text-[#101820]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'name'
                  ? 'bg-[#FEE715] text-[#101820]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('requests')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'requests'
                  ? 'bg-[#FEE715] text-[#101820]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Requests
            </button>
          </div>

          {(searchTerm || industryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setIndustryFilter('ALL');
              }}
              className="px-4 py-2 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg font-medium transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredEmployers.length} of {employers.length} employers
      </div>

      {/* Employers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployers.map((employer) => (
          <div
            key={employer.id}
            onClick={() => router.push(`/adminofjb/employers/${employer.id}`)}
            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#FEE715]/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FEE715]/0 to-[#FEE715]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

            <div className="relative space-y-4">
              {/* Company Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FEE715]/20 to-[#FEE715]/10 flex items-center justify-center border-2 border-[#FEE715]/30">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {employer.profile?.companyName || 'No Company Name'}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {employer.profile?.contactName || 'No Contact Name'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {employer.profile?.industry && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>🏭</span>
                    <span className="truncate">{employer.profile.industry}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-300">
                  <span>📧</span>
                  <span>{employer._count.requests} requests sent</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <span>📅</span>
                  <span>
                    Joined{' '}
                    {new Date(employer.user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Contact */}
              {employer.profile?.phoneNumber && (
                <ContactCard
                  name={employer.profile?.contactName || employer.user.email}
                  email={employer.user.email}
                  phone={employer.profile.phoneNumber}
                />
              )}

              {/* View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/adminofjb/employers/${employer.id}`);
                }}
                className="w-full px-4 py-2 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform group-hover:scale-105"
              >
                View Full Profile →
              </button>
            </div>
          </div>
        ))}

        {filteredEmployers.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-2">No employers found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || industryFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Employers will appear here once they register'}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
