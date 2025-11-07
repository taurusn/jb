'use client';

import { useState, useEffect } from 'react';
import DatePicker from '../shared/DatePicker';
import TimeSlotPicker from '../shared/TimeSlotPicker';

/**
 * AvailabilitySelector Component
 * Combines DatePicker and TimeSlotPicker for candidates to select recurring weekly availability
 * Manages state for days of the week with time slots
 *
 * @param value - JSON string of TimeSlot[] or null
 * @param onChange - Callback with JSON string of selected slots
 * @param disabled - Disable all selections
 */

interface TimeSlot {
  date: string; // Day name: "Sunday", "Monday", etc.
  times: string[]; // ["09:00", "10:00", ...]
}

interface AvailabilitySelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AvailabilitySelector({ value, onChange, disabled = false }: AvailabilitySelectorProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value) as TimeSlot[];
        setAvailability(parsed);

        // Select first day if available
        if (parsed.length > 0 && !selectedDay) {
          setSelectedDay(parsed[0].date);
        }
      } catch (error) {
        console.error('Failed to parse availability:', error);
        setAvailability([]);
      }
    }
  }, [value]);

  // Get times for currently selected day
  const selectedDayTimes = selectedDay
    ? availability.find((slot) => slot.date === selectedDay)?.times || []
    : [];

  // Get all days that have times selected
  const daysWithTimes = availability.map((slot) => slot.date);

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    // Don't automatically add day until user selects times
  };

  const handleTimesChange = (times: string[]) => {
    if (!selectedDay) return;

    let updated: TimeSlot[];

    if (times.length === 0) {
      // Remove day if no times selected - FIX: Filter out days with empty times
      updated = availability.filter((slot) => slot.date !== selectedDay);

      // Select another day if available
      if (updated.length > 0) {
        setSelectedDay(updated[0].date);
      } else {
        setSelectedDay(null);
      }
    } else {
      // Update times for selected day
      const existingIndex = availability.findIndex((slot) => slot.date === selectedDay);

      if (existingIndex >= 0) {
        updated = [...availability];
        updated[existingIndex] = { date: selectedDay, times };
      } else {
        // Add new day with times
        updated = [...availability, { date: selectedDay, times }];
      }
    }

    setAvailability(updated);
    onChange(JSON.stringify(updated));
  };

  const getTotalSelectedSlots = (): number => {
    return availability.reduce((total, slot) => total + slot.times.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-brand-light mb-2">
          📅 Weekly Availability
        </h3>
        <p className="text-sm text-gray-400">
          Select the days and times you're typically available for interviews each week.
          Employers will schedule interviews during your available times.
        </p>
      </div>

      {/* Date Picker */}
      <div className="glass rounded-xl p-6">
        <DatePicker
          selectedDate={selectedDay}
          onChange={handleDaySelect}
          disabled={disabled}
          daysWithTimes={daysWithTimes}
        />
      </div>

      {/* Time Slot Picker (only show if day is selected) */}
      {selectedDay && (
        <div className="glass rounded-xl p-6 animate-slide-down">
          <div className="mb-4">
            <h4 className="text-md font-semibold text-brand-light mb-1">
              Available Times on {selectedDay}s
            </h4>
            <p className="text-xs text-gray-400">
              Select all time slots you're typically available every {selectedDay} (24-hour format)
            </p>
          </div>

          <TimeSlotPicker
            selectedTimes={selectedDayTimes}
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
                Weekly Availability Summary
              </h4>
              <div className="space-y-2">
                {availability.map((slot) => (
                  <div key={slot.date} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{slot.date}s</span>
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
            No availability selected yet. Click on a day above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
