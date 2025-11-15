'use client';

import { EmployeeRequestStatus } from '@prisma/client';

interface StatusBadgeProps {
  status: EmployeeRequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'APPROVED':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
        border backdrop-blur-sm transition-all duration-300
        ${getStatusStyles()}
      `}
    >
      {status}
    </span>
  );
}
