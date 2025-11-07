'use client';

import { useState, useEffect } from 'react';
import DatePicker from '../shared/DatePicker';
import TimeSlotPicker from '../shared/TimeSlotPicker';

/**
 * AvailabilitySelector Component
 * Combines DatePicker and TimeSlotPicker for candidates to select interview availability
 * Manages state for next 7 days with time slots for each day
 *
 * @param value - JSON string of TimeSlot[] or null
 * @param onChange - Callback with JSON string of selected slots
 * @param disabled - Disable all selections
 */

interface TimeSlot {
  date: string; // YYYY-MM-DD
  times: string[]; // ["09:00", "10:00", ...]
}

interface AvailabilitySelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AvailabilitySelector({ value, onChange, disabled = false }: AvailabilitySelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value) as TimeSlot[];
        setAvailability(parsed);

        // Select first date if available
        if (parsed.length > 0 && !selectedDate) {
          setSelectedDate(parsed[0].date);
        }
      } catch (error) {
        console.error('Failed to parse availability:', error);
        setAvailability([]);
      }
    }
  }, [value]);

  // Get times for currently selected date
  const selectedDateTimes = selectedDate
    ? availability.find((slot) => slot.date === selectedDate)?.times || []
    : [];

  // Get all dates that have times selected
  const datesWithTimes = availability.map((slot) => slot.date);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);

    // If this date doesn't exist in availability yet, add it with empty times
    if (!availability.find((slot) => slot.date === date)) {
      const updated = [...availability, { date, times: [] }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      setAvailability(updated);
      onChange(JSON.stringify(updated));
    }
  };

  const handleTimesChange = (times: string[]) => {
    if (!selectedDate) return;

    let updated: TimeSlot[];

    if (times.length === 0) {
      // Remove date if no times selected
      updated = availability.filter((slot) => slot.date !== selectedDate);

      // Select another date if available
      if (updated.length > 0) {
        setSelectedDate(updated[0].date);
      } else {
        setSelectedDate(null);
      }
    } else {
      // Update times for selected date
      const existingIndex = availability.findIndex((slot) => slot.date === selectedDate);

      if (existingIndex >= 0) {
        updated = [...availability];
        updated[existingIndex] = { date: selectedDate, times };
      } else {
        updated = [...availability, { date: selectedDate, times }].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
      }
    }

    setAvailability(updated);
    onChange(JSON.stringify(updated));
  };

  const getTotalSelectedSlots = (): number => {
    return availability.reduce((total, slot) => total + slot.times.length, 0);
  };

  const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-brand-light mb-2">
          📅 Interview Availability
        </h3>
        <p className="text-sm text-gray-400">
          Select dates and time slots when you're available for interviews over the next 7 days.
          Employers will choose from your available times.
        </p>
      </div>

      {/* Date Picker */}
      <div className="glass rounded-xl p-6">
        <DatePicker
          selectedDate={selectedDate}
          onChange={handleDateSelect}
          disabled={disabled}
        />
      </div>

      {/* Time Slot Picker (only show if date is selected) */}
      {selectedDate && (
        <div className="glass rounded-xl p-6 animate-slide-down">
          <div className="mb-4">
            <h4 className="text-md font-semibold text-brand-light mb-1">
              Available Times for {formatDateDisplay(selectedDate)}
            </h4>
            <p className="text-xs text-gray-400">
              Select all time slots you're available on this date
            </p>
          </div>

          <TimeSlotPicker
            selectedTimes={selectedDateTimes}
            onChange={handleTimesChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Summary */}
      {availability.length > 0 && (
        <div className="glass rounded-xl p-4 border-l-4 border-brand-yellow">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-brand-light mb-2">
                Availability Summary
              </h4>
              <div className="space-y-2">
                {availability.map((slot) => (
                  <div key={slot.date} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{formatDateDisplay(slot.date)}</span>
                    <span className="text-brand-yellow font-medium">
                      {slot.times.length} time slot{slot.times.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Total: <strong className="text-brand-yellow">{getTotalSelectedSlots()}</strong> time slots across{' '}
                <strong className="text-brand-yellow">{availability.length}</strong> day{availability.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {availability.length === 0 && (
        <div className="glass rounded-xl p-6 text-center">
          <span className="text-4xl mb-2 block">📅</span>
          <p className="text-sm text-gray-400">
            No availability selected yet. Click on a date above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
