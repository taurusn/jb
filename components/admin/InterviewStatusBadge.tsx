'use client';

type InterviewStatus = 'live' | 'upcoming' | 'completed' | 'expired';

interface InterviewStatusBadgeProps {
  status: InterviewStatus;
  className?: string;
}

export function InterviewStatusBadge({ status, className = '' }: InterviewStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'live':
        return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/20';
      case 'upcoming':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-lg shadow-yellow-500/10';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'expired':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'live':
        return (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live Now
          </span>
        );
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
        border backdrop-blur-sm transition-all duration-300
        ${getStatusStyles()}
        ${className}
      `}
    >
      {getStatusLabel()}
    </span>
  );
}

/**
 * Helper function to determine interview status based on dates
 */
export function getInterviewStatus(
  meetingDate: Date | null,
  meetingEndsAt: Date | null,
  meetingLink: string | null
): InterviewStatus {
  if (!meetingDate) {
    return 'expired';
  }

  const now = new Date();
  const start = new Date(meetingDate);
  const end = meetingEndsAt ? new Date(meetingEndsAt) : null;

  // Meeting is currently happening
  if (start <= now && end && end >= now) {
    return 'live';
  }

  // Meeting hasn't started yet
  if (start > now) {
    return 'upcoming';
  }

  // Meeting has ended
  if (end && end < now) {
    return 'completed';
  }

  return 'expired';
}
