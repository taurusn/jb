'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewStatsCards } from '@/components/admin/InterviewStatsCards';
import { InterviewStatusBadge, getInterviewStatus } from '@/components/admin/InterviewStatusBadge';
import { ContactCard } from '@/components/admin';
import { format } from 'date-fns';

interface InterviewStats {
  todayCount: number;
  upcomingCount: number;
  completedThisMonth: number;
  totalScheduled: number;
  averageDuration: number;
}

interface Interview {
  id: string;
  meetingDate: string;
  meetingDuration: number;
  meetingEndsAt: string;
  meetingLink: string;
  status: string;
  employee: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    skills: string;
    experience: string;
    profilePictureUrl: string | null;
  };
  employer: {
    id: string;
    companyName: string;
    industry: string | null;
    phone: string;
    user: {
      email: string;
    };
  };
}

type TabType = 'today' | 'upcoming' | 'completed' | 'all';

export default function InterviewsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState<string>('all');

  useEffect(() => {
    fetchStats();
    fetchInterviews();
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/adminofjb/interviews/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const statusMap: Record<TabType, string> = {
        today: 'all', // We'll filter today client-side
        upcoming: 'upcoming',
        completed: 'completed',
        all: 'all',
      };

      const response = await fetch(
        `/api/adminofjb/interviews?status=${statusMap[activeTab]}&limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        let filtered = data.interviews;

        // Filter for today if needed
        if (activeTab === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          filtered = filtered.filter((interview: Interview) => {
            const meetingDate = new Date(interview.meetingDate);
            return meetingDate >= today && meetingDate < tomorrow;
          });
        }

        setInterviews(filtered);
      } else {
        setError('Failed to fetch interviews');
      }
    } catch (err) {
      setError('An error occurred while fetching interviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.employer.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDuration =
      durationFilter === 'all' || interview.meetingDuration === parseInt(durationFilter);

    return matchesSearch && matchesDuration;
  });

  const handleViewDetails = (id: string) => {
    router.push(`/adminofjb/requests/${id}`);
  };

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading interview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-light mb-2">
            Interview Management
          </h1>
          <p className="text-gray-400">
            Monitor and manage all scheduled interviews across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <InterviewStatsCards stats={stats} loading={false} />

      {/* Filters */}
      <div className="bg-surface-dark/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by employer or candidate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-surface-dark border border-gray-600 rounded-lg
                       text-brand-light placeholder-gray-500 focus:outline-none focus:border-brand-yellow
                       transition-colors"
            />
          </div>

          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="px-4 py-2 bg-surface-dark border border-gray-600 rounded-lg
                     text-brand-light focus:outline-none focus:border-brand-yellow
                     transition-colors"
          >
            <option value="all">All Durations</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        {[
          { key: 'today', label: 'Today', count: stats.todayCount },
          { key: 'upcoming', label: 'Upcoming', count: stats.upcomingCount },
          { key: 'completed', label: 'Completed', count: stats.completedThisMonth },
          { key: 'all', label: 'All', count: stats.totalScheduled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`
              px-6 py-3 font-medium transition-all duration-200 relative
              ${
                activeTab === tab.key
                  ? 'text-brand-yellow'
                  : 'text-gray-400 hover:text-gray-300'
              }
            `}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow" />
            )}
          </button>
        ))}
      </div>

      {/* Interviews Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading interviews...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-surface-dark/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700/50">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xl text-gray-400 mb-2">No interviews found</p>
          <p className="text-sm text-gray-500">
            {searchTerm || durationFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No interviews scheduled for this period'}
          </p>
        </div>
      ) : (
        <div className="bg-surface-dark/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-dark/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Employer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredInterviews.map((interview) => {
                  const status = getInterviewStatus(
                    new Date(interview.meetingDate),
                    new Date(interview.meetingEndsAt),
                    interview.meetingLink
                  );

                  return (
                    <tr
                      key={interview.id}
                      className="hover:bg-surface-dark/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-brand-light">
                            {format(new Date(interview.meetingDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-gray-400">
                            {format(new Date(interview.meetingDate), 'h:mm a')} ({interview.meetingDuration} min)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-brand-light">
                            {interview.employer.companyName || 'Unknown Company'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${interview.employer.phone}`}
                                className="hover:text-brand-yellow transition-colors"
                              >
                                {interview.employer.phone}
                              </a>
                              {interview.employer.user.email && (
                                <>
                                  <span>•</span>
                                  <a
                                    href={`mailto:${interview.employer.user.email}`}
                                    className="hover:text-brand-yellow transition-colors"
                                  >
                                    {interview.employer.user.email}
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {interview.employee.profilePictureUrl && (
                            <img
                              src={interview.employee.profilePictureUrl}
                              alt={interview.employee.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-brand-light">
                              {interview.employee.fullName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {interview.employee.skills.split(',').slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <InterviewStatusBadge status={status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(interview.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600
                                   text-gray-200 text-sm font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        {(status === 'live' || status === 'upcoming') && interview.meetingLink && (
                          <button
                            onClick={() => handleJoinMeeting(interview.meetingLink)}
                            className="inline-flex items-center px-3 py-1.5 bg-brand-yellow hover:bg-brand-yellow/90
                                     text-brand-dark text-sm font-medium rounded-lg transition-colors"
                          >
                            Join Meeting
                          </button>
                        )}
                        {(status === 'live' || status === 'upcoming') && !interview.meetingLink && (
                          <span className="inline-flex items-center px-3 py-1.5 bg-yellow-500/20 text-yellow-400
                                         text-xs font-medium rounded-lg border border-yellow-500/50">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No Google Meet Link
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
