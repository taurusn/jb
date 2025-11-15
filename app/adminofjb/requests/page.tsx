'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, ContactCard } from '@/components/admin';

interface Request {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  adminNotes: string | null;
  employee: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    city: string;
    position: string;
  };
  employer: {
    id: string;
    user: {
      email: string;
    };
    profile: {
      companyName: string;
      contactName: string;
      phoneNumber: string;
    } | null;
  };
  meetingLink: string | null;
  meetingDate: string | null;
}

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/adminofjb/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (err) {
      setError('An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests
    .filter((req) => {
      const matchesSearch =
        req.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employer.profile?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.status.localeCompare(b.status);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading requests...</p>
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
            onClick={fetchRequests}
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
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Employer Requests</h1>
                <p className="text-gray-400">Manage all employer-to-candidate requests</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-3xl font-bold text-[#FEE715]">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by candidate, email, or company..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="mt-4 flex items-center gap-4">
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
            onClick={() => setSortBy('status')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'status'
                ? 'bg-[#FEE715] text-[#101820]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Status
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>

      {/* Requests Grid */}
      <div className="grid gap-6">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            onClick={() => router.push(`/adminofjb/requests/${request.id}`)}
            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#FEE715]/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/0 to-[#FEE715]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Candidate Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👤</span>
                  <h3 className="text-lg font-bold text-white">Candidate</h3>
                </div>
                <div>
                  <p className="text-white font-semibold">{request.employee.fullName}</p>
                  <p className="text-sm text-gray-400">{request.employee.position}</p>
                  <p className="text-sm text-gray-400 mt-1">📍 {request.employee.city}</p>
                </div>
                <ContactCard
                  name={request.employee.fullName}
                  email={request.employee.email}
                  phone={request.employee.phoneNumber}
                />
              </div>

              {/* Employer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏢</span>
                  <h3 className="text-lg font-bold text-white">Employer</h3>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {request.employer.profile?.companyName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {request.employer.profile?.contactName || 'N/A'}
                  </p>
                </div>
                {request.employer.profile?.phoneNumber && (
                  <ContactCard
                    name={request.employer.profile?.contactName || request.employer.user.email}
                    email={request.employer.user.email}
                    phone={request.employer.profile.phoneNumber}
                  />
                )}
              </div>

              {/* Status & Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold text-white">Status</h3>
                </div>
                <StatusBadge status={request.status} />

                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Created: {new Date(request.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>

                  {request.meetingLink && (
                    <div className="flex items-center gap-2 text-green-400">
                      <span>📅</span>
                      <span>Interview Scheduled</span>
                    </div>
                  )}

                  {request.adminNotes && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <span>📝</span>
                      <span>Has Admin Notes</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/adminofjb/requests/${request.id}`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform group-hover:scale-105"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-2">No requests found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Requests will appear here once employers start requesting candidates'}
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
