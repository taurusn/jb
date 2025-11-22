'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, ContactCard, ConfirmDialog } from '@/components/admin';

interface RequestDetail {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  adminNotes: string | null;
  employee: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string;
    city: string;
    education: string;
    experience: string;
    skills: string;
    resumeUrl: string | null;
    profilePictureUrl: string | null;
  };
  employer: {
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
    industry: string | null;
  };
  meetingLink: string | null;
  meetingDate: string | null;
  meetingDuration: number | null;
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchRequest(p.id);
    });
  }, [params]);

  const fetchRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/adminofjb/requests/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Request data received:', data);
        setRequest(data);
        setNewStatus(data.status);
        setAdminNotes(data.adminNotes || '');
      } else {
        setError('Failed to fetch request details');
      }
    } catch (err) {
      setError('An error occurred while fetching request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!request) return;
    setUpdating(true);

    try {
      const response = await fetch(`/api/adminofjb/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data);
        alert('Request updated successfully!');
      } else {
        alert('Failed to update request');
      }
    } catch (err) {
      alert('An error occurred while updating request');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/adminofjb/requests/${request.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/adminofjb/requests');
      } else {
        alert('Failed to delete request');
        setDeleting(false);
      }
    } catch (err) {
      alert('An error occurred while deleting request');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 text-lg">{error || 'Request not found'}</p>
          <button
            onClick={() => router.push('/adminofjb/requests')}
            className="px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/10 via-transparent to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/adminofjb/requests')}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 hover:border-[#FEE715]/50"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Request Details</h1>
                <p className="text-gray-400">View and manage request information</p>
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">👤</span>
              <h2 className="text-2xl font-bold text-white">Candidate Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {request.employee.profilePictureUrl && (
                <div className="md:col-span-2 flex justify-center">
                  <img
                    src={request.employee.profilePictureUrl}
                    alt={request.employee.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#FEE715]/30"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                <p className="text-white font-semibold">{request.employee.fullName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Education</label>
                <p className="text-white">{request.employee.education}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">City</label>
                <p className="text-white">📍 {request.employee.city}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Experience</label>
                <p className="text-white whitespace-pre-wrap">{request.employee.experience}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {request.employee.skills ? request.employee.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#FEE715]/20 text-[#FEE715] rounded-full text-sm font-medium border border-[#FEE715]/30"
                    >
                      {skill.trim()}
                    </span>
                  )) : <span className="text-gray-400">No skills specified</span>}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-2">Contact Information</label>
                <ContactCard
                  name={request.employee.fullName}
                  email={request.employee.email || ''}
                  phone={request.employee.phone}
                />
              </div>

              {request.employee.resumeUrl && (
                <div className="md:col-span-2">
                  <a
                    href={`/view-document?file=${encodeURIComponent(request.employee.resumeUrl)}&name=${encodeURIComponent(request.employee.fullName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
                  >
                    <span>📄</span>
                    View CV
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Employer Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏢</span>
              <h2 className="text-2xl font-bold text-white">Employer Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Company Name</label>
                <p className="text-white font-semibold">
                  {request.employer.companyName}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Contact Person</label>
                <p className="text-white">{request.employer.contactPerson}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Industry</label>
                <p className="text-white">{request.employer.industry || 'N/A'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-2">Contact Information</label>
                <ContactCard
                  name={request.employer.contactPerson}
                  email={request.employer.email}
                  phone={request.employer.phone}
                />
              </div>
            </div>
          </div>

          {/* Meeting Information */}
          {request.meetingDate && (
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📅</span>
                <h2 className="text-2xl font-bold text-white">Interview Scheduled</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Meeting Date & Time</label>
                  <p className="text-white font-semibold">
                    {new Date(request.meetingDate).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Duration</label>
                  <p className="text-white">{request.meetingDuration} minutes</p>
                </div>

                {request.meetingLink ? (
                  <a
                    href={request.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all transform hover:scale-105"
                  >
                    <span>🎥</span>
                    Join Google Meet
                  </a>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">No Google Meet Link</p>
                      <p className="text-sm text-gray-400">
                        Interview time scheduled, but no Google Meet link was generated. Please contact the employer or candidate separately to arrange the meeting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Update Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal notes about this request..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FEE715] focus:border-transparent transition-all resize-none"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-3 bg-[#FEE715] hover:bg-[#FEE715]/90 text-[#101820] font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {updating ? 'Updating...' : 'Update Request'}
              </button>
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
                <label className="text-gray-400 block mb-1">Request ID</label>
                <p className="text-white font-mono text-xs break-all">{request.id}</p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Requested On</label>
                <p className="text-white">
                  {new Date(request.requestedAt).toLocaleString('en-US', {
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
              Deleting this request is permanent and cannot be undone.
            </p>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg transition-all duration-300 border border-red-500/50 hover:border-red-500"
            >
              Delete Request
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        danger={true}
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
