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
        return 'from-brand-yellow/20 to-brand-yellow/5 border-brand-yellow/30 text-brand-yellow';
      case 'blue':
        return 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400';
      case 'green':
        return 'from-accent-green/20 to-accent-green/5 border-accent-green/30 text-accent-green';
      case 'purple':
        return 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400';
      default:
        return 'from-brand-yellow/20 to-brand-yellow/5 border-brand-yellow/30 text-brand-yellow';
    }
  };

  const getGlowColor = () => {
    switch (color) {
      case 'yellow':
        return 'from-brand-yellow/0 via-brand-yellow/10 to-brand-yellow/0';
      case 'blue':
        return 'from-blue-500/0 via-blue-500/10 to-blue-500/0';
      case 'green':
        return 'from-accent-green/0 via-accent-green/10 to-accent-green/0';
      case 'purple':
        return 'from-purple-500/0 via-purple-500/10 to-purple-500/0';
      default:
        return 'from-brand-yellow/0 via-brand-yellow/10 to-brand-yellow/0';
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-6
        bg-gradient-to-br ${getColorClasses()}
        border backdrop-blur-sm
        transition-all duration-300 hover:scale-105
        group cursor-pointer
      `}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getGlowColor()} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        {/* Icon */}
        {icon && (
          <div className="mb-3 opacity-80">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>

        {/* Value */}
        <p className="text-3xl font-display font-bold text-brand-light mb-2">{value}</p>

        {/* Growth indicator */}
        {typeof growth !== 'undefined' && (
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-medium ${
                growth >= 0 ? 'text-accent-green' : 'text-accent-red'
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
