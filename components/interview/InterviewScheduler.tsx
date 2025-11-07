'use client';

import { useState, useMemo } from 'react';
import type { TimeSlot } from '@/backend/types';

interface InterviewSchedulerProps {
  candidateName: string;
  candidateEmail: string;
  availableTimeSlots: string | null; // JSON string of TimeSlot[]
  onSchedule: (date: Date, duration: number) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

export default function InterviewScheduler({
  candidateName,
  candidateEmail,
  availableTimeSlots,
  onSchedule,
  onCancel,
  loading = false,
}: InterviewSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  // Parse weekly availability data (days of week)
  const weeklyAvailability = useMemo<TimeSlot[]>(() => {
    if (!availableTimeSlots) return [];
    try {
      return JSON.parse(availableTimeSlots);
    } catch (error) {
      console.error('Failed to parse availability:', error);
      return [];
    }
  }, [availableTimeSlots]);

  // Generate next 7 days that match candidate's weekly availability
  const availableDates = useMemo(() => {
    const dates: Array<{ date: string; dayName: string; times: string[] }> = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayAvailability = weeklyAvailability.find(slot => slot.date === dayName);

      if (dayAvailability && dayAvailability.times.length > 0) {
        dates.push({
          date: date.toISOString().split('T')[0], // YYYY-MM-DD
          dayName,
          times: dayAvailability.times,
        });
      }
    }

    return dates;
  }, [weeklyAvailability]);

  // Get times for selected date
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    const dateInfo = availableDates.find(d => d.date === selectedDate);
    return dateInfo?.times || [];
  }, [selectedDate, availableDates]);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  // Handle schedule button click
  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return;

    // Combine date and time into a Date object
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const meetingDate = new Date(selectedDate + 'T00:00:00');
    meetingDate.setHours(hours, minutes, 0, 0);

    onSchedule(meetingDate, selectedDuration);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if candidate has provided availability
  if (!availableTimeSlots || weeklyAvailability.length === 0 || availableDates.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-brand-dark border border-brand-yellow/20 rounded-lg p-6 sm:p-8 max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-light mb-4">
            No Availability Provided
          </h2>
          <p className="text-gray-400 mb-6">
            {candidateName} has not provided their interview availability yet.
          </p>
          <button
            onClick={onCancel}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-brand-dark border border-brand-yellow/20 rounded-lg p-6 sm:p-8 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-light mb-2">
            Schedule Interview
          </h2>
          <p className="text-gray-400">
            Select a date and time that works for you from {candidateName}'s availability
          </p>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-brand-light mb-3">
            Select Date
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableDates.map((dateInfo) => (
              <button
                key={dateInfo.date}
                onClick={() => handleDateSelect(dateInfo.date)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedDate === dateInfo.date
                    ? 'bg-brand-yellow text-brand-dark border-brand-yellow font-bold'
                    : 'bg-brand-dark/50 border-gray-700 text-gray-300 hover:border-brand-yellow/50 hover:text-brand-light'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-xs font-medium">{formatDate(dateInfo.date)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-6 animate-slide-down">
            <h3 className="text-base sm:text-lg font-semibold text-brand-light mb-3">
              Select Time
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={loading}
                  className={`py-2 px-3 rounded-md border transition-all ${
                    selectedTime === time
                      ? 'bg-brand-yellow text-brand-dark border-brand-yellow font-bold'
                      : 'bg-brand-dark/50 border-gray-700 text-gray-300 hover:border-brand-yellow/50 hover:text-brand-light'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration Selection */}
        {selectedTime && (
          <div className="mb-6 animate-slide-down">
            <h3 className="text-base sm:text-lg font-semibold text-brand-light mb-3">
              Select Duration
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  disabled={loading}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedDuration === duration.value
                      ? 'bg-brand-yellow text-brand-dark border-brand-yellow font-bold'
                      : 'bg-brand-dark/50 border-gray-700 text-gray-300 hover:border-brand-yellow/50 hover:text-brand-light'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="mb-6 p-4 bg-brand-dark/50 border border-brand-yellow/20 rounded-lg animate-slide-down">
            <h4 className="text-sm font-semibold text-brand-yellow mb-2">Interview Summary</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="text-gray-500">Candidate:</span> {candidateName}</p>
              <p><span className="text-gray-500">Email:</span> {candidateEmail}</p>
              <p><span className="text-gray-500">Date:</span> {formatDate(selectedDate)}</p>
              <p><span className="text-gray-500">Time:</span> {selectedTime}</p>
              <p><span className="text-gray-500">Duration:</span> {DURATIONS.find(d => d.value === selectedDuration)?.label}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime || loading}
            className="flex-1 py-2.5 bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
