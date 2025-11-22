'use client';

import { StatCard } from './StatCard';

interface InterviewStats {
  todayCount: number;
  upcomingCount: number;
  completedThisMonth: number;
  totalScheduled: number;
  averageDuration: number;
}

interface InterviewStatsCardsProps {
  stats: InterviewStats;
  loading?: boolean;
}

export function InterviewStatsCards({ stats, loading = false }: InterviewStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-surface-dark/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Today's Interviews"
        value={stats.todayCount}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" className="stroke-red-400" />
            <circle cx="12" cy="12" r="3" fill="currentColor" className="text-red-400">
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        }
        color="yellow"
      />

      <StatCard
        title="Upcoming (Next 7 Days)"
        value={stats.upcomingCount}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        color="blue"
      />

      <StatCard
        title="Completed This Month"
        value={stats.completedThisMonth}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        color="green"
      />
    </div>
  );
}
