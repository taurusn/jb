'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, ContactCard, ConfirmDialog } from '@/components/admin';

interface CandidateDetail {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  position: string;
  education: string;
  yearsOfExperience: number;
  skills: string[];
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  profilePictureUrl: string | null;
  cvUrl: string | null;
  createdAt: string;
  updatedAt: string;
  requests: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    employer: {
      profile: {
        companyName: string;
      } | null;
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
        setCandidate(data.candidate);
      } else {
        setError('Failed to fetch candidate details');
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
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 text-lg">{error || 'Candidate not found'}</p>
          <button
            onClick={() => router.push('/adminofjb/candidates')}
            className="px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  const sortedAvailability = [...candidate.availability].sort(
    (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/10 via-transparent to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/adminofjb/candidates')}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 hover:border-[#FEE715]/50"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Candidate Profile</h1>
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
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">👤</span>
              <h2 className="text-2xl font-bold text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.profilePictureUrl && (
                <div className="md:col-span-2 flex justify-center">
                  <img
                    src={candidate.profilePictureUrl}
                    alt={candidate.fullName}
                    className="w-40 h-40 rounded-full object-cover border-4 border-[#FEE715]/30 shadow-lg shadow-[#FEE715]/20"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                <p className="text-white font-semibold text-lg">{candidate.fullName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Desired Position</label>
                <p className="text-white font-semibold text-lg">{candidate.position}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Education Level</label>
                <p className="text-white">{candidate.education}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Years of Experience</label>
                <p className="text-white">{candidate.yearsOfExperience} years</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Location</label>
                <p className="text-white">📍 {candidate.city}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-2">Contact Information</label>
                <ContactCard email={candidate.email} phone={candidate.phoneNumber} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔧</span>
              <h2 className="text-2xl font-bold text-white">Skills & Expertise</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {candidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#FEE715]/20 text-[#FEE715] rounded-lg font-medium border border-[#FEE715]/30 hover:bg-[#FEE715]/30 transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📅</span>
              <h2 className="text-2xl font-bold text-white">Weekly Availability</h2>
            </div>

            {sortedAvailability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedAvailability.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#FEE715]/30 transition-all"
                  >
                    <p className="text-[#FEE715] font-semibold mb-2">{slot.day}</p>
                    <p className="text-white">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No availability specified</p>
            )}
          </div>

          {/* CV Download */}
          {candidate.cvUrl && (
            <div className="bg-gradient-to-br from-[#FEE715]/10 to-[#FEE715]/5 border border-[#FEE715]/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📄</span>
                <h2 className="text-2xl font-bold text-white">Resume / CV</h2>
              </div>

              <a
                href={candidate.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
              >
                <span>📥</span>
                Download CV
              </a>
            </div>
          )}

          {/* Request History */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📋</span>
              <h2 className="text-2xl font-bold text-white">Request History</h2>
              <span className="ml-auto px-3 py-1 bg-[#FEE715]/20 text-[#FEE715] rounded-full text-sm font-semibold">
                {candidate.requests.length}
              </span>
            </div>

            {candidate.requests.length > 0 ? (
              <div className="space-y-3">
                {candidate.requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => router.push(`/adminofjb/requests/${request.id}`)}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#FEE715]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold">
                        {request.employer.profile?.companyName || 'Unknown Company'}
                      </p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-400">
                      Requested on{' '}
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="mt-2 text-xs text-[#FEE715] opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-[#FEE715]">
                  {candidate.requests.length}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {candidate.requests.filter((r) => r.status === 'PENDING').length}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-400">
                  {candidate.requests.filter((r) => r.status === 'APPROVED').length}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-400">
                  {candidate.requests.filter((r) => r.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>ℹ️</span>
              Metadata
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400 block mb-1">Candidate ID</label>
                <p className="text-white font-mono text-xs break-all">{candidate.id}</p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Application Date</label>
                <p className="text-white">
                  {new Date(candidate.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Last Updated</label>
                <p className="text-white">
                  {new Date(candidate.updatedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <span>⚠️</span>
              Danger Zone
            </h3>

            <p className="text-sm text-gray-400 mb-4">
              Deleting this candidate will remove their application and all associated
              requests permanently.
            </p>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg transition-all duration-300 border border-red-500/50 hover:border-red-500"
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
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleting}
        variant="danger"
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
