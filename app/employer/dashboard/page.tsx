'use client';

import { useState } from 'react';
import { Button, Navbar, AuthGuard, Tabs } from '@/components';
import { useApplicants, useRequestedApplicants, useDashboard, useRequest, useUpdateRequestStatus } from '@/features/employer/useEmployer';
import { useLogout } from '@/features/auth/useAuth';
import type { TabItem } from '@/components';
import InterviewScheduler from '@/components/interview/InterviewScheduler';
import SkillFilter from '@/components/employer/SkillFilter';
import { getSkillCategoryInfo, translateSkill } from '@/lib/skill-categories';

export default function EmployerDashboard() {
  const { logout } = useLogout();
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboard();
  
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

  // New skill filter state
  const [selectedSkillsArray, setSelectedSkillsArray] = useState<string[]>([]);
  const [skillMatchMode, setSkillMatchMode] = useState<'any' | 'all'>('any');

  // View mode state (list vs grid) with localStorage persistence
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('employer-dashboard-view-mode');
      return (saved as 'list' | 'grid') || 'list';
    }
    return 'list';
  });

  // Save view mode to localStorage when it changes
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('employer-dashboard-view-mode', mode);
    }
  };

  // Interview scheduling state
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedulingApplicant, setSchedulingApplicant] = useState<{
    id: string;
    name: string;
    email: string;
    availability: string | null;
  } | null>(null);

  const handleRequest = (applicant: any) => {
    // Open scheduler modal
    setSchedulingApplicant({
      id: applicant.id,
      name: applicant.fullName,
      email: applicant.email || '',
      availability: applicant.availableTimeSlots || null,
    });
    setShowScheduler(true);
  };

  const handleScheduleInterview = async (meetingDate: Date, duration: number) => {
    if (!schedulingApplicant) return;

    // Create request with meeting details
    await createRequest(schedulingApplicant.id, {
      meetingDate: meetingDate.toISOString(),
      meetingDuration: duration,
    });

    setSelectedApplicant(schedulingApplicant.id);
    setShowScheduler(false);
    setSchedulingApplicant(null);

    // Refresh both lists and stats after successful request
    setTimeout(() => {
      refetchUnrequested();
      refetchRequested();
      refetchStats(); // Refresh stats to update the counts
    }, 1000);
  };

  const handleCancelScheduling = () => {
    setShowScheduler(false);
    setSchedulingApplicant(null);
  };

  const handleFilter = () => {
    // Convert skill array to comma-separated string for API
    const skillsString = selectedSkillsArray.length > 0
      ? selectedSkillsArray.join(',')
      : '';

    const filters = {
      city: filterCity,
      education: filterEducation,
      skills: skillsString,
      search: filterSearch,
      skillMatchMode: skillMatchMode, // Pass match mode to API
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
    setSelectedSkillsArray([]);
    setSkillMatchMode('any');

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
    setSelectedSkillsArray([]);
    setSkillMatchMode('any');
  };

  const handleStatusUpdate = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingRequestId(requestId);
    await updateStatus(requestId, status);
    // Delay to show loading state, then refresh
    setTimeout(() => {
      refetchRequested();
      refetchStats(); // Refresh stats to update the counts
      setUpdatingRequestId(null);
    }, 1000);
  };

  // Helper function to check if a skill matches the active filters
  const isSkillMatched = (skill: string): boolean => {
    if (selectedSkillsArray.length === 0) return false;
    return selectedSkillsArray.some(
      filterSkill => skill.toLowerCase().includes(filterSkill.toLowerCase())
    );
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
      availableTimeSlots?: string | null;
      meetingDate?: string | null;
      meetingDuration?: number | null;
      meetingLink?: string | null;
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
            <p className="text-gray-400 text-base sm:text-lg mb-1 sm:mb-2">لا يوجد متقدمون</p>
            <p className="text-gray-500 text-xs sm:text-sm">جرب تعديل الفلاتر أو تحقق مرة أخرى لاحقًا</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4' : 'space-y-3 sm:space-y-4'}>
            {applicants.map((applicant, index) => {
              const skillsArray = applicant.skills ? applicant.skills.split(',').map((s: string) => s.trim()) : [];

              return (
              <div
                key={applicant.id}
                className={`bg-dark-400 rounded-lg p-4 sm:p-6 border-2 border-dark-300 hover:border-brand-yellow/50 transition-all duration-300 animate-slide-right ${
                  viewMode === 'grid' ? 'flex flex-col h-full' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4">
                  {/* Header with profile */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Profile Picture */}
                    {applicant.profilePictureUrl ? (
                      <img
                        src={applicant.profilePictureUrl.startsWith('supabase-private://')
                          ? `/api/files/view?file=${encodeURIComponent(applicant.profilePictureUrl)}`
                          : applicant.profilePictureUrl
                        }
                        alt={applicant.fullName}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-brand-yellow/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-yellow to-brand-yellow/70 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-brand-yellow/30">
                        <span className="text-brand-dark font-bold text-xl sm:text-2xl">
                          {applicant.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Name and Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg sm:text-xl font-bold text-brand-light">{applicant.fullName}</h3>
                        {applicant.requestStatus && (
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                            applicant.requestStatus === 'PENDING' ? 'bg-accent-orange/20 text-accent-orange border border-accent-orange/30' :
                            applicant.requestStatus === 'APPROVED' ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' :
                            applicant.requestStatus === 'REJECTED' ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' :
                            'bg-dark-300 text-gray-400'
                          }`}>
                            {applicant.requestStatus}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{applicant.city}</span>
                        <span className="text-gray-600">•</span>
                        <span>{applicant.education}</span>
                      </div>

                      {/* Skills Section - Smart Grid Display with Match Highlighting */}
                      {skillsArray.length > 0 && (
                        <div className={`mb-3 ${viewMode === 'grid' ? 'flex-1' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-brand-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-gray-400">المهارات ({skillsArray.length}):</span>
                            {selectedSkillsArray.length > 0 && (
                              <span className="text-xs text-brand-yellow/70 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                متطابقة
                              </span>
                            )}
                          </div>
                          {/* Responsive Grid: adjusted for view mode */}
                          <div className={`grid gap-1.5 sm:gap-2 ${
                            viewMode === 'list'
                              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                              : 'grid-cols-2 sm:grid-cols-2'
                          }`}>
                            {skillsArray.map((skill: string, i: number) => {
                              const isMatched = isSkillMatched(skill);
                              const categoryInfo = getSkillCategoryInfo(skill);

                              return (
                                <span
                                  key={i}
                                  className={`
                                    relative px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-center truncate transition-all duration-300
                                    ${isMatched
                                      ? 'bg-brand-yellow/20 text-brand-yellow border-2 border-brand-yellow shadow-lg shadow-brand-yellow/30 animate-pulse'
                                      : `${categoryInfo.color.bg} ${categoryInfo.color.text} border ${categoryInfo.color.border} hover:shadow-md ${categoryInfo.color.glow}`
                                    }
                                  `}
                                  title={`${translateSkill(skill)} (${categoryInfo.category})`}
                                >
                                  {isMatched && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow"></span>
                                    </span>
                                  )}
                                  {translateSkill(skill)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Experience Section */}
                      {applicant.experience && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <svg className="w-4 h-4 text-brand-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-gray-400">الخبرة:</span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {applicant.experience.length > 120
                              ? `${applicant.experience.substring(0, 120)}...`
                              : applicant.experience
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meeting Details for Requested Candidates */}
                  {!showRequestButton && (applicant as any).meetingDate && (
                    <div className="bg-brand-yellow/5 border-2 border-brand-yellow/30 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-brand-yellow flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-brand-yellow text-sm sm:text-base">Interview Scheduled</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{new Date((applicant as any).meetingDate).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Duration: {(applicant as any).meetingDuration || 30} min</span>
                        </div>
                      </div>
                      {(applicant as any).meetingLink && (
                        <a
                          href={(applicant as any).meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Google Meet
                        </a>
                      )}
                    </div>
                  )}

                  {/* Availability for Unrequested Candidates */}
                  {showRequestButton && (applicant as any).availableTimeSlots && (() => {
                    try {
                      const availability = JSON.parse((applicant as any).availableTimeSlots);
                      const formattedSlots = availability.map((slot: { date: string; times: string[] }) => {
                        const times = slot.times.map(time => {
                          const [hours, minutes] = time.split(':');
                          const hour = parseInt(hours);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                          return `${displayHour}:${minutes} ${ampm}`;
                        }).join(', ');
                        return `${slot.date} at ${times}`;
                      }).join(' • ');

                      return (
                        <div className="bg-dark-300/30 border border-dark-300 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <span className="text-xs sm:text-sm text-gray-400">التوفر: </span>
                              <span className="text-xs sm:text-sm text-gray-300 font-medium">{formattedSlots}</span>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      // If parsing fails, show raw text
                      return (
                        <div className="bg-dark-300/30 border border-dark-300 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm text-gray-400">التوفر:</span>
                            <span className="text-xs sm:text-sm text-gray-300 font-medium">{(applicant as any).availableTimeSlots}</span>
                          </div>
                        </div>
                      );
                    }
                  })()}

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
                          <span className="hidden sm:inline">عرض السيرة الذاتية</span>
                          <span className="sm:hidden">CV</span>
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
                          onClick={() => handleRequest(applicant)}
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
                              <span className="hidden sm:inline">طلب المرشح</span>
                              <span className="sm:hidden">طلب</span>
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
                                <span className="hidden sm:inline">موافقة</span>
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
                            <span className="hidden sm:inline">رفض</span>
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
                            {applicant.requestStatus === 'APPROVED' ? 'موافق عليه' : 'مرفوض'}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              );
            })}
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
      label: 'المرشحون المتاحون',
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
      label: 'المرشحون المطلوبون',
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
      <div className="min-h-screen bg-brand-dark font-arabic" dir="rtl">
        <Navbar isAuthenticated onLogout={logout} />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-16 sm:pt-20">
          {/* Header */}
          <div className="mb-4 sm:mb-6 animate-slide-down">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-brand-light mb-1 sm:mb-2">
              لوحة التحكم
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-400">
              إدارة الطلبات والعثور على المرشحين المثاليين لفريقك
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
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">قيد الانتظار</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-orange">{stats?.pendingRequests || 0}</div>
                </div>

                <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:scale-105 transition-transform duration-300 animate-scale-in" style={{ animationDelay: '50ms' }}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">موافق عليه</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent-green">{stats?.approvedRequests || 0}</div>
                </div>

                <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:scale-105 transition-transform duration-300 animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-gray-400 text-xs sm:text-sm font-medium">مرفوض</span>
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
                    تصفية المتقدمين
                  </h2>
                  {(filterSearch || filterCity || filterEducation || filterSkills || selectedSkillsArray.length > 0) && (
                    <span className="bg-brand-yellow text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full">
                      نشط
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

            {/* View Mode Toggle */}
          <div className="mb-4 flex justify-end gap-2">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-brand-yellow text-brand-dark shadow-lg shadow-brand-yellow/20'
                  : 'bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-brand-light border border-dark-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">عرض قائمة</span>
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-brand-yellow text-brand-dark shadow-lg shadow-brand-yellow/20'
                  : 'bg-dark-400 text-gray-400 hover:bg-dark-300 hover:text-brand-light border border-dark-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span className="hidden sm:inline">عرض شبكي</span>
            </button>
          </div>

          {/* Expandable Filter Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">بحث</label>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="البحث بالاسم، المدينة، التعليم..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-dark-400 border-2 border-dark-300 text-brand-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow"
                  />
                </div>

                {/* Multi-Select Skill Filter */}
                <SkillFilter
                  selectedSkills={selectedSkillsArray}
                  onSkillsChange={setSelectedSkillsArray}
                  matchMode={skillMatchMode}
                  onMatchModeChange={setSkillMatchMode}
                />

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <Button variant="primary" size="sm" onClick={handleFilter} className="flex-1">
                    <span className="hidden sm:inline">تطبيق الفلاتر</span>
                    <span className="sm:hidden">تطبيق</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="px-3 sm:px-4">
                    <span className="hidden sm:inline">مسح</span>
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

        {/* Interview Scheduler Modal */}
        {showScheduler && schedulingApplicant && (
          <InterviewScheduler
            candidateName={schedulingApplicant.name}
            candidateEmail={schedulingApplicant.email}
            availableTimeSlots={schedulingApplicant.availability}
            onSchedule={handleScheduleInterview}
            onCancel={handleCancelScheduling}
            loading={requestLoading}
          />
        )}
      </div>
    </AuthGuard>
  );
}