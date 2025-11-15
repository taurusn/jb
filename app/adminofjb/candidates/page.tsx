'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactCard } from '@/components/admin';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  position: string;
  education: string;
  yearsOfExperience: number;
  skills: string[];
  profilePictureUrl: string | null;
  cvUrl: string | null;
  createdAt: string;
  _count: {
    requests: number;
  };
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [educationFilter, setEducationFilter] = useState<string>('ALL');
  const [experienceFilter, setExperienceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'experience'>('date');

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
  const educationLevels = Array.from(new Set(candidates.map((c) => c.education))).sort();

  const filteredCandidates = candidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCity = cityFilter === 'ALL' || candidate.city === cityFilter;
      const matchesEducation =
        educationFilter === 'ALL' || candidate.education === educationFilter;

      let matchesExperience = true;
      if (experienceFilter === '0-2') {
        matchesExperience = candidate.yearsOfExperience <= 2;
      } else if (experienceFilter === '3-5') {
        matchesExperience =
          candidate.yearsOfExperience >= 3 && candidate.yearsOfExperience <= 5;
      } else if (experienceFilter === '6+') {
        matchesExperience = candidate.yearsOfExperience >= 6;
      }

      return matchesSearch && matchesCity && matchesEducation && matchesExperience;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName);
      } else {
        return b.yearsOfExperience - a.yearsOfExperience;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading candidates...</p>
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
            onClick={fetchCandidates}
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
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Job Candidates</h1>
                <p className="text-gray-400">Manage all candidate applications</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Candidates</p>
              <p className="text-3xl font-bold text-[#FEE715]">{candidates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, position, or skills..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
            >
              <option value="ALL">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Education Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Education
            </label>
            <select
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
            >
              <option value="ALL">All Levels</option>
              {educationLevels.map((edu) => (
                <option key={edu} value={edu}>
                  {edu}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Experience
            </label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
            >
              <option value="ALL">All Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6+">6+ years</option>
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
              onClick={() => setSortBy('experience')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'experience'
                  ? 'bg-[#FEE715] text-[#101820]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Experience
            </button>
          </div>

          {(searchTerm || cityFilter !== 'ALL' || educationFilter !== 'ALL' || experienceFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCityFilter('ALL');
                setEducationFilter('ALL');
                setExperienceFilter('ALL');
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
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => router.push(`/adminofjb/candidates/${candidate.id}`)}
            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#FEE715]/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FEE715]/0 to-[#FEE715]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

            <div className="relative space-y-4">
              {/* Profile Picture & Name */}
              <div className="flex items-center gap-4">
                {candidate.profilePictureUrl ? (
                  <img
                    src={candidate.profilePictureUrl}
                    alt={candidate.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#FEE715]/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#FEE715]/20 flex items-center justify-center border-2 border-[#FEE715]/30">
                    <span className="text-2xl">👤</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {candidate.fullName}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{candidate.position}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <span>📍</span>
                  <span>{candidate.city}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>🎓</span>
                  <span className="truncate">{candidate.education}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>💼</span>
                  <span>{candidate.yearsOfExperience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>📧</span>
                  <span>{candidate._count.requests} employer requests</span>
                </div>
              </div>

              {/* Skills Preview */}
              {candidate.skills.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#FEE715]/20 text-[#FEE715] rounded text-xs font-medium border border-[#FEE715]/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs font-medium">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              <ContactCard email={candidate.email} phone={candidate.phoneNumber} />

              {/* View Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/adminofjb/candidates/${candidate.id}`);
                }}
                className="w-full px-4 py-2 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform group-hover:scale-105"
              >
                View Full Profile →
              </button>
            </div>
          </div>
        ))}

        {filteredCandidates.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-2">No candidates found</p>
            <p className="text-sm text-gray-500">
              {searchTerm ||
              cityFilter !== 'ALL' ||
              educationFilter !== 'ALL' ||
              experienceFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Candidates will appear here once they submit applications'}
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
