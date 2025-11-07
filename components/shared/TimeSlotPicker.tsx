'use client';

import { useState } from 'react';

/**
 * TimeSlotPicker Component
 * Reusable component for selecting time slots with brand styling
 *
 * @param selectedTimes - Array of selected time strings (HH:MM format)
 * @param onChange - Callback when selection changes
 * @param disabled - Disable all selections
 */

interface TimeSlotPickerProps {
  selectedTimes: string[];
  onChange: (times: string[]) => void;
  disabled?: boolean;
}

// Generate time slots from 09:00 to 17:00 in 30-minute intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 17 && minute > 0) break; // Stop at 17:00
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const formatTimeDisplay = (time: string): string => {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
  return `${displayHour}:${minute} ${period}`;
};

export default function TimeSlotPicker({ selectedTimes, onChange, disabled = false }: TimeSlotPickerProps) {
  const timeSlots = generateTimeSlots();

  const handleTimeToggle = (time: string) => {
    if (disabled) return;

    if (selectedTimes.includes(time)) {
      // Remove time
      onChange(selectedTimes.filter((t) => t !== time));
    } else {
      // Add time
      onChange([...selectedTimes, time].sort());
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange(timeSlots);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-light">
          Select Available Times
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-xs text-brand-yellow hover:text-brand-yellow/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <span className="text-gray-600">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-gray-400 hover:text-brand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Time slot grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {timeSlots.map((time) => {
          const isSelected = selectedTimes.includes(time);

          return (
            <button
              key={time}
              type="button"
              onClick={() => handleTimeToggle(time)}
              disabled={disabled}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-brand-yellow text-brand-dark border-2 border-brand-yellow shadow-yellow-glow'
                    : 'bg-dark-400 text-brand-light border-2 border-dark-300 hover:border-brand-yellow/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
            >
              {formatTimeDisplay(time)}
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {selectedTimes.length > 0 && (
        <p className="text-xs text-gray-400">
          {selectedTimes.length} time{selectedTimes.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
