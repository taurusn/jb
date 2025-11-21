'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactCard } from '@/components/admin';

interface PendingEmployer {
  id: string;
  email: string;
  commercialRegistrationNumber: string;
  commercialRegistrationImageUrl: string;
  status: string;
  createdAt: string;
  employerProfile: {
    id: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    companyWebsite: string | null;
    industry: string | null;
    companySize: string | null;
  } | null;
}

export default function PendingEmployersPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<PendingEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEmployers();
  }, []);

  const fetchPendingEmployers = async () => {
    try {
      const response = await fetch('/api/adminofjb/employers/pending');
      if (response.ok) {
        const data = await response.json();
        setEmployers(data.employers);
      } else {
        setError('Failed to fetch pending employers');
      }
    } catch (err) {
      setError('An error occurred while fetching pending employers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (employerId: string) => {
    if (!confirm('Are you sure you want to approve this employer?')) return;

    setProcessingId(employerId);
    try {
      const response = await fetch(`/api/adminofjb/employers/${employerId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        // Remove from list
        setEmployers((prev) => prev.filter((e) => e.id !== employerId));
        alert('Employer approved successfully!');
      } else {
        alert('Failed to approve employer');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (employerId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; // Cancelled

    setProcessingId(employerId);
    try {
      const response = await fetch(`/api/adminofjb/employers/${employerId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        // Remove from list
        setEmployers((prev) => prev.filter((e) => e.id !== employerId));
        alert('Employer rejected successfully');
      } else {
        alert('Failed to reject employer');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const viewCrDocument = (url: string, companyName: string) => {
    // Use the document viewer page for consistent viewing experience
    window.open(`/view-document?file=${encodeURIComponent(url)}&name=${encodeURIComponent(companyName + ' - CR Document')}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading pending employers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass rounded-xl p-8 max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-300 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchPendingEmployers}
            className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 via-transparent to-transparent rounded-xl blur-xl" />
        <div className="relative glass rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow/70 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Pending Employers</h1>
                <p className="text-gray-400">Review and approve employer applications</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Pending Applications</p>
              <p className="text-3xl font-display font-bold text-brand-yellow">{employers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employers Grid */}
      {employers.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-400 mb-2">No pending applications</p>
          <p className="text-sm text-gray-500">All employer applications have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {employers.map((employer) => (
            <div
              key={employer.id}
              className="group relative glass rounded-xl p-6 hover:border-brand-yellow/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-yellow/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/0 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

              <div className="relative space-y-4">
                {/* Company Info */}
                <div>
                  <h3 className="text-xl font-display font-bold text-brand-light mb-1">
                    {employer.employerProfile?.companyName || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-400">{employer.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Applied {new Date(employer.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Contact Person</p>
                    <p className="text-brand-light font-medium">{employer.employerProfile?.contactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Industry</p>
                    <p className="text-brand-light font-medium">{employer.employerProfile?.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company Size</p>
                    <p className="text-brand-light font-medium">{employer.employerProfile?.companySize || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CR Number</p>
                    <p className="text-brand-yellow font-mono text-xs">{employer.commercialRegistrationNumber}</p>
                  </div>
                </div>

                {/* Contact Card */}
                {employer.employerProfile && (
                  <div className="pt-2 border-t border-white/10">
                    <ContactCard
                      name={employer.employerProfile.contactPerson}
                      email={employer.email}
                      phone={employer.employerProfile.phone}
                    />
                  </div>
                )}

                {/* CR Document Button */}
                <button
                  onClick={() => viewCrDocument(employer.commercialRegistrationImageUrl, employer.employerProfile?.companyName || 'Company')}
                  className="w-full px-4 py-3 bg-dark-400 hover:bg-dark-300 border-2 border-brand-yellow/30 hover:border-brand-yellow rounded-lg text-brand-yellow font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View CR Document
                </button>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(employer.id)}
                    disabled={processingId === employer.id}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processingId === employer.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(employer.id)}
                    disabled={processingId === employer.id}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
