'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactCard } from '@/components/admin';

interface Employer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  industry: string;
  companySize: string | null;
  companyWebsite: string | null;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  _count: {
    employeeRequests: number;
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
    new Set(employers.map((e) => e.industry).filter(Boolean))
  ).sort() as string[];

  const filteredEmployers = employers
    .filter((employer) => {
      const matchesSearch =
        employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        industryFilter === 'ALL' || employer.industry === industryFilter;

      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return (
          new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime()
        );
      } else if (sortBy === 'name') {
        return a.companyName.localeCompare(b.companyName);
      } else {
        return b._count.employeeRequests - a._count.employeeRequests;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading employers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass rounded-xl p-8 max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-300 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchEmployers}
            className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 via-transparent to-transparent rounded-xl blur-xl" />
        <div className="relative glass rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow/70 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Employers</h1>
                <p className="text-gray-400">Manage all registered employers</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Employers</p>
              <p className="text-3xl font-display font-bold text-brand-yellow">{employers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, contact name, or email..."
                className="w-full pl-12 pr-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
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
              className="w-full px-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
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
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'name'
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('requests')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'requests'
                  ? 'bg-brand-yellow text-brand-dark'
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
              className="px-4 py-2 bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-brand-light rounded-lg font-medium transition-all"
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
            className="group relative glass rounded-xl p-6 hover:border-brand-yellow/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-brand-yellow/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

            <div className="relative space-y-4">
              {/* Company Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-brand-yellow/10 flex items-center justify-center border-2 border-brand-yellow/20">
                  <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-display font-bold text-brand-light truncate">
                    {employer.companyName}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{employer.contactPerson}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {/* Industry */}
                {employer.industry && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{employer.industry}</span>
                  </div>
                )}

                {/* Company Size */}
                {employer.companySize && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="truncate">{employer.companySize}</span>
                  </div>
                )}

                {/* Website */}
                {employer.companyWebsite && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a
                      href={employer.companyWebsite.startsWith('http') ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="truncate hover:text-brand-yellow transition-colors"
                    >
                      {employer.companyWebsite.replace(/^https?:\/\//,'')}
                    </a>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{employer.user.email}</span>
                </div>

                {/* Requests Count */}
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{employer._count.employeeRequests} candidate requests</span>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    Joined{' '}
                    {new Date(employer.user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Contact Card */}
              <div className="pt-2 border-t border-white/10">
                <ContactCard
                  name={employer.contactPerson}
                  email={employer.user.email}
                  phone={employer.phone}
                />
              </div>

              {/* View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/adminofjb/employers/${employer.id}`);
                }}
                className="w-full px-4 py-2 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all transform group-hover:scale-105"
              >
                View Full Profile →
              </button>
            </div>
          </div>
        ))}

        {filteredEmployers.length === 0 && (
          <div className="col-span-full text-center py-16 glass rounded-xl">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xl text-gray-400 mb-2">No employers found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || industryFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Employers will appear here once they register'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
