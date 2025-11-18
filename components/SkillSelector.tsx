'use client';

import { useState, useEffect } from 'react';

// Predefined skills for restaurant/hospitality industry
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

interface SkillSelectorProps {
  value?: string | string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function SkillSelector({
  value = [],
  onChange,
  disabled = false,
  required = false,
}: SkillSelectorProps) {
  // Parse initial value - handle both string and array formats
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // If it's a comma-separated string, split it
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  });

  const toggleSkill = (skill: string) => {
    if (disabled) return;

    setSelectedSkills((prev) => {
      const newSkills = prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill];

      // Call onChange with new value
      onChange(newSkills);
      return newSkills;
    });
  };

  const isSelected = (skill: string) => selectedSkills.includes(skill);

  return (
    <div className="space-y-3">
      <label className="block text-xs sm:text-sm font-semibold text-brand-light">
        Select Your Skills {required && <span className="text-brand-yellow">*</span>}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AVAILABLE_SKILLS.map((skill) => {
          const selected = isSelected(skill);

          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              disabled={disabled}
              className={`
                relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300
                text-left group
                ${
                  selected
                    ? 'bg-brand-yellow/10 border-brand-yellow shadow-lg shadow-brand-yellow/20'
                    : 'bg-dark-400 border-dark-300 hover:border-brand-yellow/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-dark
              `}
            >
              {/* Custom Checkbox */}
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300
                  ${
                    selected
                      ? 'bg-brand-yellow border-brand-yellow'
                      : 'bg-dark-300 border-dark-200 group-hover:border-brand-yellow/50'
                  }
                `}
              >
                {selected && (
                  <svg
                    className="w-3.5 h-3.5 text-brand-dark"
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
                  text-sm sm:text-base font-medium transition-colors duration-300
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

      {/* Selected count indicator */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <p className="text-gray-400">
          {selectedSkills.length > 0 ? (
            <>
              <span className="text-brand-yellow font-semibold">{selectedSkills.length}</span>
              {' skill'}
              {selectedSkills.length !== 1 && 's'} selected
            </>
          ) : (
            <span className="text-gray-500">Select at least one skill</span>
          )}
        </p>

        {selectedSkills.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedSkills([])}
            disabled={disabled}
            className="text-accent-orange hover:text-accent-red transition-colors duration-200 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
