'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactCard } from '@/components/admin';

interface Candidate {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string;
  nationality: string;
  skills: string; // TEXT field, not array
  experience: string; // TEXT field
  resumeUrl: string | null;
  profilePictureUrl: string | null;
  submittedAt: string;
  _count: {
    employeeRequests: number;
  };
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/adminofjb/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates);
      } else {
        setError('Failed to fetch candidates');
      }
    } catch (err) {
      setError('An error occurred while fetching candidates');
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const cities = Array.from(new Set(candidates.map((c) => c.city))).sort();
  const nationalities = Array.from(new Set(candidates.map((c) => c.nationality))).sort();

  // Parse skills string to array for display
  const parseSkills = (skillsStr: string): string[] => {
    if (!skillsStr) return [];
    return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  };

  const filteredCandidates = candidates
    .filter((candidate) => {
      const skillsArray = parseSkills(candidate.skills);
      const matchesSearch =
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        candidate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skillsArray.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCity = cityFilter === 'ALL' || candidate.city === cityFilter;
      const matchesNationality =
        nationalityFilter === 'ALL' || candidate.nationality === nationalityFilter;

      return matchesSearch && matchesCity && matchesNationality;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else {
        return a.fullName.localeCompare(b.fullName);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading candidates...</p>
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
            onClick={fetchCandidates}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Job Candidates</h1>
                <p className="text-gray-400">Manage all candidate applications</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Candidates</p>
              <p className="text-3xl font-display font-bold text-brand-yellow">{candidates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, city, or skills..."
                className="w-full pl-12 pr-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
            >
              <option value="ALL">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Nationality Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nationality
            </label>
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className="w-full px-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
            >
              <option value="ALL">All Nationalities</option>
              {nationalities.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
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
          </div>

          {(searchTerm || cityFilter !== 'ALL' || nationalityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCityFilter('ALL');
                setNationalityFilter('ALL');
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
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => {
          const skillsArray = parseSkills(candidate.skills);
          return (
            <div
              key={candidate.id}
              onClick={() => router.push(`/adminofjb/candidates/${candidate.id}`)}
              className="group relative glass rounded-xl p-6 hover:border-brand-yellow/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-brand-yellow/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

              <div className="relative space-y-4">
                {/* Profile Picture & Name */}
                <div className="flex items-center gap-4">
                  {candidate.profilePictureUrl ? (
                    <img
                      src={
                        candidate.profilePictureUrl.startsWith('supabase-private://')
                          ? `/api/files/view?file=${encodeURIComponent(candidate.profilePictureUrl)}`
                          : candidate.profilePictureUrl
                      }
                      alt={candidate.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-brand-yellow/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-yellow/10 flex items-center justify-center border-2 border-brand-yellow/20">
                      <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-display font-bold text-brand-light truncate">
                      {candidate.fullName}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">{candidate.nationality}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{candidate.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{candidate.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{candidate._count.employeeRequests} employer requests</span>
                  </div>
                </div>

                {/* Skills Preview */}
                {skillsArray.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {skillsArray.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow rounded text-xs font-medium border border-brand-yellow/20"
                        >
                          {skill}
                        </span>
                      ))}
                      {skillsArray.length > 3 && (
                        <span className="px-2 py-1 bg-dark-400 text-gray-400 rounded text-xs font-medium border border-dark-300">
                          +{skillsArray.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Card */}
                <div className="pt-2 border-t border-white/10">
                  <ContactCard
                    name={candidate.fullName}
                    email={candidate.email || ''}
                    phone={candidate.phone}
                  />
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/adminofjb/candidates/${candidate.id}`);
                  }}
                  className="w-full px-4 py-2 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all transform group-hover:scale-105"
                >
                  View Full Profile →
                </button>
              </div>
            </div>
          );
        })}

        {filteredCandidates.length === 0 && (
          <div className="col-span-full text-center py-16 glass rounded-xl">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xl text-gray-400 mb-2">No candidates found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ||
              cityFilter !== 'ALL' ||
              nationalityFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Candidates will appear here once they submit applications'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
