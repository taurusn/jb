'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, ContactCard } from '@/components/admin';

interface Request {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;  // Changed from createdAt
  adminNotes: string | null;
  employee: {
    id: string;
    fullName: string;
    email: string | null;  // Added null
    phone: string;  // Changed from phoneNumber
    city: string;
  };
  employer: {  // Flattened structure
    id: string;
    companyName: string;
    contactPerson: string;
    phone: string;
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
        (req.employee.email && req.employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        req.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
      return a.status.localeCompare(b.status);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading requests...</p>
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
            onClick={fetchRequests}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Employer Requests</h1>
                <p className="text-gray-400">Manage all employer-to-candidate requests</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-3xl font-display font-bold text-brand-yellow">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Search by candidate, email, or company..."
                className="w-full pl-12 pr-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-dark-400 border-2 border-dark-300 rounded-lg text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
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
                ? 'bg-brand-yellow text-brand-dark'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Date
          </button>
          <button
            onClick={() => setSortBy('status')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'status'
                ? 'bg-brand-yellow text-brand-dark'
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
            className="group relative glass rounded-xl p-6 hover:border-brand-yellow/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-brand-yellow/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Candidate Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-display font-bold text-brand-light">Candidate</h3>
                </div>
                <div>
                  <p className="text-brand-light font-semibold">{request.employee.fullName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-400">{request.employee.city}</p>
                  </div>
                </div>
                <ContactCard
                  name={request.employee.fullName}
                  email={request.employee.email || ''}
                  phone={request.employee.phone}
                />
              </div>

              {/* Employer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-display font-bold text-brand-light">Employer</h3>
                </div>
                <div>
                  <p className="text-brand-light font-semibold">
                    {request.employer.companyName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {request.employer.contactPerson}
                  </p>
                </div>
                <ContactCard
                  name={request.employer.contactPerson}
                  email=""
                  phone={request.employer.phone}
                />
              </div>

              {/* Status & Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-display font-bold text-brand-light">Status</h3>
                </div>
                <StatusBadge status={request.status} />

                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Requested: {new Date(request.requestedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>

                  {request.meetingLink && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Interview Scheduled</span>
                    </div>
                  )}

                  {request.adminNotes && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Has Admin Notes</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/adminofjb/requests/${request.id}`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all transform group-hover:scale-105"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-16 glass rounded-xl">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
