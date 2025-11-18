'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, ContactCard, ConfirmDialog } from '@/components/admin';

interface CandidateDetail {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string;
  education: string;
  skills: string;
  experience: string;
  availableTimeSlots: string | null;
  profilePictureUrl: string | null;
  resumeUrl: string | null;
  submittedAt: string;
  employeeRequests: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    employer: {
      companyName: string;
      contactPerson: string;
      phone: string;
    };
  }[];
}

const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface TimeSlot {
  date: string; // Day name (e.g., "Monday")
  times: string[]; // Array of available times (e.g., ["09:00", "10:00", "14:00"])
}

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchCandidate(p.id);
    });
  }, [params]);

  const fetchCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/adminofjb/candidates/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Candidate data received:', data);
        console.log('📅 Available time slots raw:', data.availableTimeSlots);
        setCandidate(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch candidate details');
      }
    } catch (err) {
      setError('An error occurred while fetching candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!candidate) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/adminofjb/candidates/${candidate.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/adminofjb/candidates');
      } else {
        alert('Failed to delete candidate');
        setDeleting(false);
      }
    } catch (err) {
      alert('An error occurred while deleting candidate');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass border-accent-red/30 rounded-xl p-8 max-w-md">
          <svg className="w-16 h-16 text-accent-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-accent-red mb-6 text-lg">{error || 'Candidate not found'}</p>
          <button
            onClick={() => router.push('/adminofjb/candidates')}
            className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all transform hover:scale-105"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  // Parse skills from comma-separated string to array
  const skillsArray = candidate.skills ? candidate.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Parse availability from JSON string (if exists)
  let availability: TimeSlot[] = [];
  try {
    if (candidate.availableTimeSlots) {
      console.log('📅 Parsing availability:', candidate.availableTimeSlots);
      availability = JSON.parse(candidate.availableTimeSlots);
      console.log('✅ Parsed availability:', availability);
    } else {
      console.log('⚠️ No availableTimeSlots found');
    }
  } catch (e) {
    console.error('❌ Failed to parse availability:', e);
    console.error('Raw value:', candidate.availableTimeSlots);
  }

  const sortedAvailability = availability.sort(
    (a, b) => DAYS_ORDER.indexOf(a.date) - DAYS_ORDER.indexOf(b.date)
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/5 via-transparent to-transparent rounded-xl blur-xl" />
        <div className="relative glass rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/adminofjb/candidates')}
                className="w-12 h-12 rounded-xl bg-dark-400 hover:bg-dark-300 flex items-center justify-center transition-all border border-dark-300 hover:border-brand-yellow/50"
              >
                <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Candidate Profile</h1>
                <p className="text-gray-400">Complete candidate information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="glass rounded-xl p-6 hover:border-brand-yellow/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-2xl font-display font-bold text-brand-light">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.profilePictureUrl && (
                <div className="md:col-span-2 flex justify-center">
                  <img
                    src={
                      candidate.profilePictureUrl.startsWith('supabase-private://')
                        ? `/api/files/view?file=${encodeURIComponent(candidate.profilePictureUrl)}`
                        : candidate.profilePictureUrl
                    }
                    alt={candidate.fullName}
                    className="w-40 h-40 rounded-full object-cover border-4 border-brand-yellow/20 shadow-lg shadow-brand-yellow/10"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                <p className="text-brand-light font-semibold text-lg">{candidate.fullName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Education Level</label>
                <p className="text-brand-light">{candidate.education}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Experience</label>
                <p className="text-brand-light whitespace-pre-wrap">{candidate.experience}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Location</label>
                <div className="flex items-center gap-2 text-brand-light">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {candidate.city}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-2">Contact Information</label>
                <ContactCard name={candidate.fullName} email={candidate.email || ''} phone={candidate.phone} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass rounded-xl p-6 hover:border-brand-yellow/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-display font-bold text-brand-light">Skills & Expertise</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {skillsArray.length > 0 ? (
                skillsArray.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-brand-yellow/10 text-brand-yellow rounded-lg font-medium border border-brand-yellow/20 hover:bg-brand-yellow/15 transition-all"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400">No skills specified</p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="glass rounded-xl p-6 hover:border-brand-yellow/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-display font-bold text-brand-light">Weekly Availability</h2>
            </div>

            {sortedAvailability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedAvailability.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-dark-400 rounded-lg p-4 border border-dark-300 hover:border-brand-yellow/30 transition-all"
                  >
                    <p className="text-brand-yellow font-semibold mb-2">{slot.date}</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.times.map((time, timeIndex) => (
                        <span
                          key={timeIndex}
                          className="px-2 py-1 bg-brand-yellow/10 text-brand-light text-sm rounded border border-brand-yellow/20"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No availability specified</p>
            )}
          </div>

          {/* CV View/Download */}
          {candidate.resumeUrl && (
            <div className="glass border-brand-yellow/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-2xl font-display font-bold text-brand-light">Resume / CV</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`/view-document?file=${encodeURIComponent(candidate.resumeUrl)}&name=${encodeURIComponent(candidate.fullName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View CV
                </a>

                <a
                  href={`/api/files/view?file=${encodeURIComponent(candidate.resumeUrl)}`}
                  download
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-400 border-2 border-brand-yellow/30 text-brand-yellow rounded-lg font-semibold hover:bg-dark-300 hover:border-brand-yellow/50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CV
                </a>
              </div>
            </div>
          )}

          {/* Request History */}
          <div className="glass rounded-xl p-6 hover:border-brand-yellow/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h2 className="text-2xl font-display font-bold text-brand-light">Request History</h2>
              <span className="ml-auto px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-full text-sm font-semibold border border-brand-yellow/20">
                {candidate.employeeRequests.length}
              </span>
            </div>

            {candidate.employeeRequests.length > 0 ? (
              <div className="space-y-3">
                {candidate.employeeRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => router.push(`/adminofjb/requests/${request.id}`)}
                    className="bg-dark-400 rounded-lg p-4 border border-dark-300 hover:border-brand-yellow/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-brand-light font-semibold">
                        {request.employer.companyName || 'Unknown Company'}
                      </p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-400">
                      Requested on{' '}
                      {new Date(request.requestedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="mt-2 text-xs text-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view details →
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No employer requests yet
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Actions & Metadata */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-display font-bold text-brand-light mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="bg-dark-400 rounded-lg p-4 border border-dark-300">
                <p className="text-sm text-gray-400 mb-1">Total Requests</p>
                <p className="text-3xl font-display font-bold text-brand-yellow">
                  {candidate.employeeRequests.length}
                </p>
              </div>

              <div className="bg-dark-400 rounded-lg p-4 border border-dark-300">
                <p className="text-sm text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-display font-bold text-accent-orange">
                  {candidate.employeeRequests.filter((r) => r.status === 'PENDING').length}
                </p>
              </div>

              <div className="bg-dark-400 rounded-lg p-4 border border-dark-300">
                <p className="text-sm text-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-display font-bold text-accent-green">
                  {candidate.employeeRequests.filter((r) => r.status === 'APPROVED').length}
                </p>
              </div>

              <div className="bg-dark-400 rounded-lg p-4 border border-dark-300">
                <p className="text-sm text-gray-400 mb-1">Rejected</p>
                <p className="text-3xl font-display font-bold text-accent-red">
                  {candidate.employeeRequests.filter((r) => r.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-display font-bold text-brand-light mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Metadata
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400 block mb-1">Candidate ID</label>
                <p className="text-brand-light font-mono text-xs break-all">{candidate.id}</p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Application Date</label>
                <p className="text-brand-light">
                  {new Date(candidate.submittedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass border-accent-red/30 rounded-xl p-6">
            <h3 className="text-xl font-display font-bold text-accent-red mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Danger Zone
            </h3>

            <p className="text-sm text-gray-400 mb-4">
              Deleting this candidate will remove their application and all associated
              requests permanently.
            </p>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-3 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red font-bold rounded-lg transition-all duration-300 border border-accent-red/50 hover:border-accent-red"
            >
              Delete Candidate
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${candidate.fullName}? This will also delete all associated employer requests. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        danger={true}
      />
    </div>
  );
}
