'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  totalCandidates: number;
  candidatesGrowth: number;
  totalEmployers: number;
  employersGrowth: number;
  totalRequests: number;
  requestsGrowth: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeInterviewsToday: number;
  requestsOverTime: { date: string; count: number }[];
  requestsByStatus: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
  topCities: { city: string; count: number }[];
  candidatesByNationality: { nationality: string; count: number }[];
  skillsDistribution: { skill: string; count: number }[];
  topSkills: { skill: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/adminofjb/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError('An error occurred while fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass rounded-xl p-8 max-w-md border-accent-red/30">
          <svg className="w-16 h-16 text-accent-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-accent-red mb-6 text-lg">{error || 'Failed to load data'}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const COLORS = {
    PENDING: '#FEE715',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
  };

  const pieData = [
    { name: 'Pending', value: stats.requestsByStatus.PENDING },
    { name: 'Approved', value: stats.requestsByStatus.APPROVED },
    { name: 'Rejected', value: stats.requestsByStatus.REJECTED },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header with enhanced styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 via-transparent to-transparent rounded-xl blur-xl" />
        <div className="relative glass rounded-xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow/70 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Admin Dashboard</h1>
              <p className="text-gray-400">Platform overview and analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates}
          growth={stats.candidatesGrowth}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Total Employers"
          value={stats.totalEmployers}
          growth={stats.employersGrowth}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          growth={stats.requestsGrowth}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Interviews Today"
          value={stats.activeInterviewsToday}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Status Overview - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-accent-orange/10 to-accent-orange/5 border border-accent-orange/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-accent-orange text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Requests
            </p>
            <p className="text-4xl font-display font-bold text-brand-light">{stats.pendingRequests}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-accent-green/10 to-accent-green/5 border border-accent-green/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-accent-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-accent-green text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approved Requests
            </p>
            <p className="text-4xl font-display font-bold text-brand-light">{stats.approvedRequests}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-accent-red/10 to-accent-red/5 border border-accent-red/30 rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-accent-red text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rejected Requests
            </p>
            <p className="text-4xl font-display font-bold text-brand-light">{stats.rejectedRequests}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time */}
        <div className="glass rounded-xl p-6 hover:border-brand-yellow/30 transition-all">
          <h2 className="text-2xl font-display font-bold text-brand-light mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Requests Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.requestsOverTime}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FEE715" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FEE715" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101820',
                  border: '1px solid #FEE715',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                labelStyle={{ color: '#FEE715' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FEE715"
                strokeWidth={3}
                dot={{ fill: '#FEE715', r: 4 }}
                activeDot={{ r: 6, fill: '#FEE715' }}
                fill="url(#colorRequests)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Requests by Status */}
        <div className="glass rounded-xl p-6 hover:border-brand-yellow/30 transition-all">
          <h2 className="text-2xl font-display font-bold text-brand-light mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(COLORS)[index]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101820',
                  border: '1px solid #FEE715',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities */}
        <div className="glass rounded-xl p-6 hover:border-brand-yellow/30 transition-all">
          <h2 className="text-2xl font-display font-bold text-brand-light mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Top Cities
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topCities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="city" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101820',
                  border: '1px solid #FEE715',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="count" fill="#FEE715" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Candidates by Education */}
        <div className="glass rounded-xl p-6 hover:border-brand-yellow/30 transition-all">
          <h2 className="text-2xl font-display font-bold text-brand-light mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Candidates by Nationality
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.candidatesByNationality}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="nationality"
                stroke="#9CA3AF"
                fontSize={10}
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101820',
                  border: '1px solid #10B981',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Skills - NEW */}
        <div className="glass rounded-xl p-6 hover:border-brand-yellow/30 transition-all">
          <h2 className="text-2xl font-display font-bold text-brand-light mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Most In-Demand Skills
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topSkills} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                type="category"
                dataKey="skill"
                stroke="#9CA3AF"
                fontSize={10}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101820',
                  border: '1px solid #FEE715',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="count" fill="#FEE715" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution (Full Chart) - NEW */}
        <div className="glass rounded-xl p-6 hover:border-brand-yellow/30 transition-all">
          <h2 className="text-2xl font-display font-bold text-brand-light mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Skills Overview
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.skillsDistribution.map((skill, index) => {
              const maxCount = Math.max(...stats.skillsDistribution.map(s => s.count));
              const percentage = (skill.count / maxCount) * 100;

              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-brand-light transition-colors">
                      {skill.skill}
                    </span>
                    <span className="text-xs font-semibold text-brand-yellow bg-brand-yellow/10 px-2 py-0.5 rounded-full">
                      {skill.count}
                    </span>
                  </div>
                  <div className="w-full bg-dark-300 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-yellow to-brand-yellow/70 h-full rounded-full transition-all duration-500 ease-out group-hover:shadow-lg group-hover:shadow-brand-yellow/30"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills Insights Summary - NEW */}
      <div className="glass rounded-xl p-6 border-2 border-brand-yellow/30">
        <h2 className="text-2xl font-display font-bold text-brand-light mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-yellow/5 border border-brand-yellow/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Most Popular</p>
                <p className="text-brand-light font-bold text-lg">{stats.topSkills[0]?.skill || 'N/A'}</p>
                <p className="text-brand-yellow text-xs">{stats.topSkills[0]?.count || 0} candidates</p>
              </div>
            </div>
          </div>
          <div className="bg-accent-green/5 border border-accent-green/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Total Skills</p>
                <p className="text-brand-light font-bold text-lg">{stats.skillsDistribution.length}</p>
                <p className="text-accent-green text-xs">Available skills</p>
              </div>
            </div>
          </div>
          <div className="bg-accent-orange/5 border border-accent-orange/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Avg Skills/Candidate</p>
                <p className="text-brand-light font-bold text-lg">
                  {(stats.skillsDistribution.reduce((sum, s) => sum + s.count, 0) / stats.totalCandidates).toFixed(1)}
                </p>
                <p className="text-accent-orange text-xs">Per applicant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
