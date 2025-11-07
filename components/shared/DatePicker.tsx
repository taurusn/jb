'use client';

/**
 * DatePicker Component
 * Reusable calendar-style date picker with brand styling
 * Shows next 7 days only
 *
 * @param selectedDate - Currently selected date (YYYY-MM-DD)
 * @param onChange - Callback when date changes
 * @param disabled - Disable all selections
 * @param availableDates - Optional array of available dates (if limited)
 */

interface DatePickerProps {
  selectedDate: string | null;
  onChange: (date: string) => void;
  disabled?: boolean;
  availableDates?: string[]; // Array of YYYY-MM-DD strings
}

const generateNext7Days = (): Date[] => {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  return days;
};

const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const formatDateDisplay = (date: Date): {
  dayName: string;
  dayNumber: string;
  monthName: string;
} => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate().toString();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return { dayName, dayNumber, monthName };
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export default function DatePicker({
  selectedDate,
  onChange,
  disabled = false,
  availableDates,
}: DatePickerProps) {
  const next7Days = generateNext7Days();

  const handleDateSelect = (date: Date) => {
    if (disabled) return;
    const isoDate = formatDateToISO(date);

    // If availableDates is provided, check if date is available
    if (availableDates && !availableDates.includes(isoDate)) return;

    onChange(isoDate);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-brand-light">
        Select Interview Date
      </p>

      <div className="grid grid-cols-7 gap-2">
        {next7Days.map((date) => {
          const isoDate = formatDateToISO(date);
          const isSelected = selectedDate === isoDate;
          const { dayName, dayNumber, monthName } = formatDateDisplay(date);
          const isTodayDate = isToday(date);

          // Check if date is available (if availableDates is provided)
          const isAvailable = availableDates ? availableDates.includes(isoDate) : true;

          return (
            <button
              key={isoDate}
              type="button"
              onClick={() => handleDateSelect(date)}
              disabled={disabled || !isAvailable}
              className={`
                relative flex flex-col items-center justify-center
                p-3 rounded-xl
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-brand-yellow text-brand-dark border-2 border-brand-yellow shadow-yellow-glow scale-105'
                    : isAvailable
                    ? 'bg-dark-400 text-brand-light border-2 border-dark-300 hover:border-brand-yellow/50 hover:scale-105'
                    : 'bg-dark-500 text-gray-600 border-2 border-dark-400 opacity-40 cursor-not-allowed'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Today indicator */}
              {isTodayDate && isAvailable && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-green rounded-full"></span>
              )}

              {/* Day name */}
              <span className="text-xs font-semibold mb-1">
                {dayName}
              </span>

              {/* Day number */}
              <span className="text-xl font-bold">
                {dayNumber}
              </span>

              {/* Month */}
              <span className="text-xs mt-1 opacity-75">
                {monthName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-accent-green rounded-full"></span>
          <span>Today</span>
        </div>
        {availableDates && availableDates.length < 7 && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
            <span>Not Available</span>
          </div>
        )}
      </div>
    </div>
  );
}
