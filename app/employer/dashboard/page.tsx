'use client';

import { useState } from 'react';
import { Button, Navbar, AuthGuard, Tabs } from '@/components';
import { useApplicants, useRequestedApplicants, useDashboard, useRequest, useUpdateRequestStatus } from '@/features/employer/useEmployer';
import { useLogout } from '@/features/auth/useAuth';
import type { TabItem } from '@/components';

export default function EmployerDashboard() {
  const { logout } = useLogout();
  const { stats, loading: statsLoading } = useDashboard();
  
  // Unrequested applicants
  const { 
    applicants: unrequestedApplicants, 
    loading: unrequestedLoading, 
    currentPage: unrequestedCurrentPage, 
    totalPages: unrequestedTotalPages, 
    fetchApplicants: fetchUnrequestedApplicants, 
    refetch: refetchUnrequested 
  } = useApplicants();

  // Requested applicants
  const { 
    applicants: requestedApplicants, 
    loading: requestedLoading, 
    currentPage: requestedCurrentPage, 
    totalPages: requestedTotalPages, 
    fetchApplicants: fetchRequestedApplicants, 
    refetch: refetchRequested 
  } = useRequestedApplicants();

  const { createRequest, loading: requestLoading, success: requestSuccess, error: requestError } = useRequest();
  const { updateStatus, loading: updateLoading } = useUpdateRequestStatus();

  console.log('Dashboard - unrequested applicants:', unrequestedApplicants, 'loading:', unrequestedLoading);
  console.log('Dashboard - requested applicants:', requestedApplicants, 'loading:', requestedLoading);

  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('');
  const [filterEducation, setFilterEducation] = useState('');
  const [filterSkills, setFilterSkills] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [activeTab, setActiveTab] = useState('unrequested');
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const handleRequest = async (employeeId: string) => {
    await createRequest(employeeId);
    setSelectedApplicant(employeeId);
    // Refresh both lists after successful request
    setTimeout(() => {
      refetchUnrequested();
      refetchRequested();
    }, 1000);
  };

  const handleFilter = () => {
    const filters = {
      city: filterCity,
      education: filterEducation,
      skills: filterSkills,
      search: filterSearch,
    };
    
    if (activeTab === 'unrequested') {
      fetchUnrequestedApplicants(1, filters);
    } else {
      fetchRequestedApplicants(1, filters);
    }
  };

  const handleClearFilters = () => {
    setFilterCity('');
    setFilterEducation('');
    setFilterSkills('');
    setFilterSearch('');
    
    if (activeTab === 'unrequested') {
      fetchUnrequestedApplicants(1, {});
    } else {
      fetchRequestedApplicants(1, {});
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Clear filters when switching tabs
    setFilterCity('');
    setFilterEducation('');
    setFilterSkills('');
    setFilterSearch('');
  };

  const handleStatusUpdate = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingRequestId(requestId);
    await updateStatus(requestId, status);
    // Delay to show loading state, then refresh
    setTimeout(() => {
      refetchRequested();
      setUpdatingRequestId(null);
    }, 1000);
  };

  // Function to render applicant list
  const renderApplicantsList = (
    applicants: Array<{
      id: string;
      fullName: string;
      phone: string;
      email: string | null;
      city: string;
      education: string;
      skills: string;
      experience: string;
      resumeUrl: string | null;
      profilePictureUrl: string | null;
      submittedAt: Date;
      requestStatus?: string;
      requestId?: string;
    }>, 
    loading: boolean, 
    currentPage: number, 
    totalPages: number, 
    fetchApplicants: (page: number) => void,
    refetch: () => void,
    showRequestButton = true
  ) => {
    return (
      <div className="mt-4 sm:mt-6">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-dark-400 rounded-lg p-4 sm:p-6 animate-pulse">
                <div className="h-3 sm:h-4 bg-dark-300 rounded w-1/3 mb-2 sm:mb-3"></div>
                <div className="h-2.5 sm:h-3 bg-dark-300 rounded w-1/2 mb-1.5 sm:mb-2"></div>
                <div className="h-2.5 sm:h-3 bg-dark-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-base sm:text-lg mb-1 sm:mb-2">No applicants found</p>
            <p className="text-gray-500 text-xs sm:text-sm">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {applicants.map((applicant, index) => (
              <div
                key={applicant.id}
                className="bg-dark-400 rounded-lg p-4 sm:p-6 border-2 border-dark-300 hover:border-brand-yellow/50 transition-all duration-300 animate-slide-right"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-yellow rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-dark font-bold text-base sm:text-lg">
                          {applicant.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-brand-light truncate">{applicant.fullName}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">{applicant.city}</p>
                      </div>
                      {applicant.requestStatus && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          applicant.requestStatus === 'PENDING' ? 'bg-accent-orange/20 text-accent-orange' :
                          applicant.requestStatus === 'APPROVED' ? 'bg-accent-green/20 text-accent-green' :
                          applicant.requestStatus === 'REJECTED' ? 'bg-accent-red/20 text-accent-red' :
                          'bg-dark-300 text-gray-400'
                        }`}>
                          {applicant.requestStatus}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 min-w-0">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{applicant.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{applicant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{applicant.education}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{new Date(applicant.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-dark-300">
                    {applicant.resumeUrl ? (
                      <a
                        href={`/view-document?file=${encodeURIComponent(applicant.resumeUrl)}&name=${encodeURIComponent(applicant.fullName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1"
                      >
                        <Button variant="outline" size="sm" fullWidth>
                          <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline">View Resume</span>
                          <span className="sm:hidden">View CV</span>
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" fullWidth disabled>
                        <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">No Resume</span>
                        <span className="sm:hidden">No CV</span>
                      </Button>
                    )}
                    
                    {showRequestButton ? (
                      // For unrequested candidates - show request button
                      selectedApplicant === applicant.id && requestSuccess ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-green/10 border border-accent-green text-accent-green rounded-lg sm:flex-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium">Requested!</span>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRequest(applicant.id)}
                          disabled={requestLoading}
                          className="sm:flex-1"
                        >
                          {requestLoading && selectedApplicant === applicant.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">Requesting...</span>
                              <span className="sm:hidden">...</span>
                            </div>
                          ) : (
                            <>
                              <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className="hidden sm:inline">Request Candidate</span>
                              <span className="sm:hidden">Request</span>
                            </>
                          )}
                        </Button>
                      )
                    ) : (
                      // For requested candidates - show status management
                      applicant.requestStatus === 'PENDING' ? (
                        <div className="flex gap-2 sm:flex-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(applicant.requestId!, 'APPROVED')}
                            disabled={updateLoading && updatingRequestId === applicant.requestId}
                            className="flex-1"
                          >
                            {updateLoading && updatingRequestId === applicant.requestId ? (
                              <div className="flex items-center gap-1 justify-center">
                                <div className="w-3 h-3 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="hidden sm:inline">Approve</span>
                                <span className="sm:hidden">✓</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(applicant.requestId!, 'REJECTED')}
                            disabled={updateLoading && updatingRequestId === applicant.requestId}
                            className="flex-1 border-accent-red text-accent-red hover:bg-accent-red hover:text-white"
                          >
                            <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Reject</span>
                            <span className="sm:hidden">✗</span>
                          </Button>
                        </div>
                      ) : (
                        // Show final status
                        <div className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:flex-1 ${
                          applicant.requestStatus === 'APPROVED' 
                            ? 'bg-accent-green/10 border border-accent-green text-accent-green' 
                            : 'bg-accent-red/10 border border-accent-red text-accent-red'
                        }`}>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {applicant.requestStatus === 'APPROVED' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                          <span className="text-xs sm:text-sm font-medium">
                            {applicant.requestStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchApplicants(currentPage - 1)}
              disabled={currentPage === 1}
              className="min-w-[80px] sm:min-w-[100px]"
            >
              <span className="hidden sm:inline">← Previous</span>
              <span className="sm:hidden">← Prev</span>
            </Button>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchApplicants(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm sm:text-base transition-all ${
                    page === currentPage
                      ? 'bg-brand-yellow text-brand-dark'
                      : 'bg-dark-400 text-gray-400 hover:bg-dark-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchApplicants(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="min-w-[80px] sm:min-w-[100px]"
            >
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">Next →</span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Create tab items
  const tabItems: TabItem[] = [
    {
      key: 'unrequested',
      label: 'Available Candidates',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: unrequestedApplicants.length,
      content: renderApplicantsList(
        unrequestedApplicants,
        unrequestedLoading,
        unrequestedCurrentPage,
        unrequestedTotalPages,
        fetchUnrequestedApplicants,
        refetchUnrequested,
        true
      )
    },
    {
      key: 'requested',
      label: 'Requested Candidates',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: requestedApplicants.length,
      content: renderApplicantsList(
        requestedApplicants,
        requestedLoading,
        requestedCurrentPage,
        requestedTotalPages,
        fetchRequestedApplicants,
        refetchRequested,
        false
      )
    }
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-brand-dark">
        <Navbar isAuthenticated onLogout={logout} />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-16 sm:pt-20">
          {/* Header */}
          <div className="mb-4 sm:mb-6 animate-slide-down">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-brand-light mb-1 sm:mb-2">
              Employer Dashboard
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-400">
              Manage applications and find the perfect candidates for your team
            </p>
          </div>

          {/* Stats Grid - Only Status Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            {statsLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 animate-pulse">
                  <div className="h-3 sm:h-4 bg-dark-300 rounded w-1/2 mb-3 sm:mb-4"></div>
                  <div className="h-6 sm:h-8 bg-dark-300 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              <>
                <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:scale-105 transition-transform duration-300 animate-scale-in">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">Pending</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-orange">{stats?.pendingRequests || 0}</div>
                </div>

                <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:scale-105 transition-transform duration-300 animate-scale-in" style={{ animationDelay: '50ms' }}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">Approved</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-green">{stats?.approvedRequests || 0}</div>
                </div>

                <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:scale-105 transition-transform duration-300 animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">Rejected</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-red">{stats?.rejectedRequests || 0}</div>
                </div>
              </>
            )}
          </div>

          {/* Collapsible Filters */}
          <div className="mb-4 sm:mb-6 animate-slide-up">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="w-full glass rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 hover:bg-dark-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-brand-light">
                    Filter Applicants
                  </h2>
                  {(filterSearch || filterCity || filterEducation || filterSkills) && (
                    <span className="bg-brand-yellow text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expandable Filter Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">Search</label>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Search by name, city, education..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow"
                  />
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">City</label>
                    <input
                      type="text"
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      placeholder="e.g., New York"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">Education</label>
                    <input
                      type="text"
                      value={filterEducation}
                      onChange={(e) => setFilterEducation(e.target.value)}
                      placeholder="e.g., Bachelor's"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">Skills</label>
                    <input
                      type="text"
                      value={filterSkills}
                      onChange={(e) => setFilterSkills(e.target.value)}
                      placeholder="e.g., JavaScript"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <Button variant="primary" size="sm" onClick={handleFilter} className="flex-1">
                    <span className="hidden sm:inline">Apply Filters</span>
                    <span className="sm:hidden">Apply</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="px-3 sm:px-4">
                    <span className="hidden sm:inline">Clear</span>
                    <span className="sm:hidden">✕</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Applicants Lists */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Tabs
              items={tabItems}
              defaultActiveKey="unrequested"
              onChange={handleTabChange}
              variant="pills"
              size="md"
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}