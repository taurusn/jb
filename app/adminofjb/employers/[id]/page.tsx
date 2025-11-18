'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge, ContactCard, ConfirmDialog } from '@/components/admin';

interface EmployerDetail {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  industry: string;
  companySize: string | null;
  companyWebsite: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  employeeRequests: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    employee: {
      id: string;
      fullName: string;
      phone: string;
      email: string;
      city: string;
      education: string;
      skills: string;
    };
  }[];
  stats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    activeInterviews: number;
  };
}

export default function EmployerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [employer, setEmployer] = useState<EmployerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchEmployer(p.id);
    });
  }, [params]);

  const fetchEmployer = async (employerId: string) => {
    try {
      const response = await fetch(`/api/adminofjb/employers/${employerId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployer(data.employer);
      } else {
        setError('Failed to fetch employer details');
      }
    } catch (err) {
      setError('An error occurred while fetching employer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employer) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/adminofjb/employers/${employer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/adminofjb/employers');
      } else {
        alert('Failed to delete employer');
        setDeleting(false);
      }
    } catch (err) {
      alert('An error occurred while deleting employer');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading employer details...</p>
        </div>
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 text-lg">{error || 'Employer not found'}</p>
          <button
            onClick={() => router.push('/adminofjb/employers')}
            className="px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
          >
            Back to Employers
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
                onClick={() => router.push('/adminofjb/employers')}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 hover:border-[#FEE715]/50"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Employer Profile</h1>
                <p className="text-gray-400">Complete employer information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏢</span>
              <h2 className="text-2xl font-bold text-white">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Company Name</label>
                <p className="text-white font-semibold text-lg">
                  {employer.companyName}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Contact Person</label>
                <p className="text-white font-semibold text-lg">
                  {employer.contactPerson}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Industry</label>
                <p className="text-white">{employer.industry || 'Not specified'}</p>
              </div>

              {employer.companySize && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Company Size</label>
                  <p className="text-white">{employer.companySize}</p>
                </div>
              )}

              {employer.companyWebsite && (
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Website</label>
                  <a
                    href={employer.companyWebsite.startsWith('http') ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FEE715] hover:underline"
                  >
                    {employer.companyWebsite}
                  </a>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-2">
                  Contact Information
                </label>
                <ContactCard
                  name={employer.contactPerson}
                  email={employer.user.email}
                  phone={employer.phone}
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">👤</span>
              <h2 className="text-2xl font-bold text-white">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                <p className="text-white font-semibold">{employer.user.email}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Role</label>
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/30">
                  {employer.user.role}
                </span>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Registration Date</label>
                <p className="text-white">
                  {new Date(employer.user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Last Activity</label>
                <p className="text-white">
                  {new Date(employer.user.updatedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Request History */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📋</span>
              <h2 className="text-2xl font-bold text-white">Request History</h2>
              <span className="ml-auto px-3 py-1 bg-[#FEE715]/20 text-[#FEE715] rounded-full text-sm font-semibold">
                {employer.employeeRequests.length}
              </span>
            </div>

            {employer.employeeRequests.length > 0 ? (
              <div className="space-y-3">
                {employer.employeeRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => router.push(`/adminofjb/requests/${request.id}`)}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#FEE715]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">
                          {request.employee.fullName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {request.employee.education} • {request.employee.city}
                        </p>
                      </div>
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
                    <div className="mt-2 text-xs text-[#FEE715] opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view details →
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No candidate requests yet
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Stats & Actions */}
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
                  {employer.stats.totalRequests}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {employer.stats.pendingRequests}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-400">
                  {employer.stats.approvedRequests}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-400">
                  {employer.stats.rejectedRequests}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Active Interviews</p>
                <p className="text-3xl font-bold text-blue-400">
                  {employer.stats.activeInterviews}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📅</span>
              Activity
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400 block mb-1">Member Since</label>
                <p className="text-white">
                  {Math.floor(
                    (Date.now() - new Date(employer.user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>

              {employer.employeeRequests.length > 0 && (
                <>
                  <div>
                    <label className="text-gray-400 block mb-1">First Request</label>
                    <p className="text-white">
                      {new Date(
                        Math.min(...employer.employeeRequests.map((r) => new Date(r.requestedAt).getTime()))
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Latest Request</label>
                    <p className="text-white">
                      {new Date(
                        Math.max(...employer.employeeRequests.map((r) => new Date(r.requestedAt).getTime()))
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </>
              )}
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
                <label className="text-gray-400 block mb-1">Employer ID</label>
                <p className="text-white font-mono text-xs break-all">{employer.id}</p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Account Created</label>
                <p className="text-white">
                  {new Date(employer.user.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Last Updated</label>
                <p className="text-white">
                  {new Date(employer.user.updatedAt).toLocaleString('en-US', {
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
              Deleting this employer will remove their account, profile, and all
              associated requests permanently.
            </p>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg transition-all duration-300 border border-red-500/50 hover:border-red-500"
            >
              Delete Employer
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Employer"
        message={`Are you sure you want to delete ${
          employer.companyName
        }? This will also delete their account and all ${
          employer.employeeRequests.length
        } associated requests. This action cannot be undone.`}
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
