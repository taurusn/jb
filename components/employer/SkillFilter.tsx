'use client';

import { useState, useEffect } from 'react';

// Predefined skills for restaurant/hospitality industry (matching SkillSelector)
const AVAILABLE_SKILLS = [
  'Barista / Coffee Maker',
  'Chef / Cook',
  'Kitchen Assistant',
  'Baker / Pastry',
  'Waiter / Customer Service',
  'Cashier',
  'Cleaner / Steward',
  'Restaurant Supervisor / Manager',
] as const;

interface SkillFilterProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  matchMode: 'any' | 'all';
  onMatchModeChange: (mode: 'any' | 'all') => void;
  disabled?: boolean;
}

export default function SkillFilter({
  selectedSkills,
  onSkillsChange,
  matchMode,
  onMatchModeChange,
  disabled = false,
}: SkillFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSkill = (skill: string) => {
    if (disabled) return;

    if (selectedSkills.includes(skill)) {
      // Remove skill
      onSkillsChange(selectedSkills.filter((s) => s !== skill));
    } else {
      // Add skill
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const clearAll = () => {
    onSkillsChange([]);
  };

  const selectAll = () => {
    onSkillsChange([...AVAILABLE_SKILLS]);
  };

  const isSelected = (skill: string) => selectedSkills.includes(skill);

  return (
    <div className="space-y-3">
      {/* Filter Header with Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-dark-400 border-2 border-dark-300 rounded-lg hover:border-brand-yellow/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm sm:text-base font-medium text-brand-light">
            Filter by Skills
          </span>
          {selectedSkills.length > 0 && (
            <span className="bg-brand-yellow text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedSkills.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 animate-slide-down">
          {/* Match Mode Toggle */}
          <div className="bg-dark-400 border-2 border-dark-300 rounded-lg p-3 sm:p-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">
              Match Type
            </label>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onMatchModeChange('any')}
                disabled={disabled}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                  matchMode === 'any'
                    ? 'bg-brand-yellow text-brand-dark shadow-lg shadow-brand-yellow/20'
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-200 hover:text-brand-light'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Match Any (OR)
              </button>
              <button
                type="button"
                onClick={() => onMatchModeChange('all')}
                disabled={disabled}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                  matchMode === 'all'
                    ? 'bg-brand-yellow text-brand-dark shadow-lg shadow-brand-yellow/20'
                    : 'bg-dark-300 text-gray-400 hover:bg-dark-200 hover:text-brand-light'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Match All (AND)
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {matchMode === 'any'
                ? 'Show candidates with at least one selected skill'
                : 'Show only candidates with all selected skills'}
            </p>
          </div>

          {/* Skills Grid */}
          <div className="bg-dark-400 border-2 border-dark-300 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-400">
                Select Skills
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={disabled || selectedSkills.length === AVAILABLE_SKILLS.length}
                  className="text-xs text-brand-yellow hover:text-brand-yellow/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select All
                </button>
                <span className="text-gray-600">•</span>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={disabled || selectedSkills.length === 0}
                  className="text-xs text-accent-orange hover:text-accent-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {AVAILABLE_SKILLS.map((skill) => {
                const selected = isSelected(skill);

                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={disabled}
                    className={`
                      relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300
                      text-left group
                      ${
                        selected
                          ? 'bg-brand-yellow/10 border-brand-yellow shadow-md shadow-brand-yellow/10'
                          : 'bg-dark-300 border-dark-200 hover:border-brand-yellow/50 hover:bg-dark-200'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-dark-400
                    `}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`
                        flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all duration-300
                        ${
                          selected
                            ? 'bg-brand-yellow border-brand-yellow'
                            : 'bg-dark-400 border-gray-600 group-hover:border-brand-yellow/50'
                        }
                      `}
                    >
                      {selected && (
                        <svg
                          className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-brand-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Skill Label */}
                    <span
                      className={`
                        text-xs sm:text-sm font-medium transition-colors duration-300
                        ${selected ? 'text-brand-light' : 'text-gray-300 group-hover:text-brand-light'}
                      `}
                    >
                      {skill}
                    </span>

                    {/* Glow effect when selected */}
                    {selected && (
                      <div className="absolute inset-0 rounded-lg bg-brand-yellow/5 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Skills Summary */}
          {selectedSkills.length > 0 && (
            <div className="bg-dark-400 border-2 border-brand-yellow/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-400">
                  Active Filters ({selectedSkills.length})
                </span>
                <span className="text-xs text-brand-yellow font-semibold">
                  {matchMode === 'any' ? 'Any Match' : 'All Match'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 rounded-full text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      disabled={disabled}
                      className="hover:text-accent-red transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
