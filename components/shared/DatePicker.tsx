'use client';

/**
 * DatePicker Component (Weekly Schedule)
 * Shows days of the week for recurring weekly availability
 *
 * @param selectedDate - Currently selected day name ("Sunday", "Monday", etc.)
 * @param onChange - Callback when day changes
 * @param disabled - Disable all selections
 * @param daysWithTimes - Days that have time slots selected
 */

interface DatePickerProps {
  selectedDate: string | null; // Day name
  onChange: (day: string) => void;
  disabled?: boolean;
  daysWithTimes?: string[];
}

const DAYS_OF_WEEK = [
  { name: 'Sunday', short: 'Sun' },
  { name: 'Monday', short: 'Mon' },
  { name: 'Tuesday', short: 'Tue' },
  { name: 'Wednesday', short: 'Wed' },
  { name: 'Thursday', short: 'Thu' },
  { name: 'Friday', short: 'Fri' },
  { name: 'Saturday', short: 'Sat' },
];

export default function DatePicker({
  selectedDate,
  onChange,
  disabled = false,
  daysWithTimes = [],
}: DatePickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-brand-light">
        Select Day of the Week
      </p>

      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDate === day.name;
          const hasTimes = daysWithTimes.includes(day.name);

          return (
            <button
              key={day.name}
              type="button"
              onClick={() => !disabled && onChange(day.name)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center justify-center
                p-3 rounded-xl
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-brand-yellow text-brand-dark border-2 border-brand-yellow shadow-yellow-glow scale-105'
                    : 'bg-dark-400 text-brand-light border-2 border-dark-300 hover:border-brand-yellow/50 hover:scale-105'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Day short name */}
              <span className="text-xs font-semibold">
                {day.short}
              </span>

              {/* Indicator if this day has times selected */}
              {hasTimes && !isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-yellow rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
