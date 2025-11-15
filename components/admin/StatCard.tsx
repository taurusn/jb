'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  growth?: number;
  icon?: ReactNode;
  color?: 'yellow' | 'blue' | 'green' | 'purple';
}

export function StatCard({ title, value, growth, icon, color = 'yellow' }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'yellow':
        return 'from-[#FEE715]/20 to-[#FEE715]/5 border-[#FEE715]/30';
      case 'blue':
        return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
      case 'green':
        return 'from-green-500/20 to-green-500/5 border-green-500/30';
      case 'purple':
        return 'from-purple-500/20 to-purple-500/5 border-purple-500/30';
      default:
        return 'from-[#FEE715]/20 to-[#FEE715]/5 border-[#FEE715]/30';
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${getColorClasses()}
        border backdrop-blur-sm
        transition-all duration-300 hover:scale-105
        group cursor-pointer
      `}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/0 via-[#FEE715]/10 to-[#FEE715]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Icon */}
        {icon && (
          <div className="mb-3 text-[#FEE715] opacity-80">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>

        {/* Value */}
        <p className="text-3xl font-bold text-white mb-2">{value}</p>

        {/* Growth indicator */}
        {typeof growth !== 'undefined' && (
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-medium ${
                growth >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
            </span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
