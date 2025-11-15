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
  candidatesByEducation: { education: string; count: number }[];
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
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 text-lg">{error || 'Failed to load data'}</p>
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
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
    <div className="space-y-8 animate-fadeIn">
      {/* Header with enhanced styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/10 via-transparent to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FEE715] to-[#FEE715]/70 flex items-center justify-center shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Admin Dashboard</h1>
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
          icon={<span className="text-4xl">👥</span>}
          color="yellow"
        />
        <StatCard
          title="Total Employers"
          value={stats.totalEmployers}
          growth={stats.employersGrowth}
          icon={<span className="text-4xl">🏢</span>}
          color="blue"
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          growth={stats.requestsGrowth}
          icon={<span className="text-4xl">📋</span>}
          color="green"
        />
        <StatCard
          title="Interviews Today"
          value={stats.activeInterviewsToday}
          icon={<span className="text-4xl">📅</span>}
          color="purple"
        />
      </div>

      {/* Status Overview - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-yellow-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              Pending Requests
            </p>
            <p className="text-4xl font-bold text-white">{stats.pendingRequests}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-green-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Approved Requests
            </p>
            <p className="text-4xl font-bold text-white">{stats.approvedRequests}</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-red-400 text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">❌</span>
              Rejected Requests
            </p>
            <p className="text-4xl font-bold text-white">{stats.rejectedRequests}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📈</span> Requests Over Time
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
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🥧</span> Status Distribution
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
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📍</span> Top Cities
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
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎓</span> Education Levels
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.candidatesByEducation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="education"
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
      </div>

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
