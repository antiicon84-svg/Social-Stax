import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '~/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import {
  Users, Search, Plus, Building2, Briefcase, ExternalLink,
  TrendingUp, Calendar, Target, FileText, Zap, BarChart2,
  ArrowUpRight, Clock, Star, Activity, ChevronRight, Sparkles
} from 'lucide-react';

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  accent: 'cyan' | 'purple' | 'blue' | 'red';
}> = ({ icon, label, value, trend, trendUp, accent }) => {
  const accentMap = {
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
  };
  const glowMap = {
    cyan: 'shadow-cyan-900/20',
    purple: 'shadow-purple-900/20',
    blue: 'shadow-blue-900/20',
    red: 'shadow-red-900/20',
  };
  return (
    <div className={`relative bg-gradient-to-br ${accentMap[accent]} border rounded-2xl p-5 overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-lg ${glowMap[accent]}`}>
      {/* Background glow */}
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 ${
        accent === 'cyan' ? 'bg-cyan-500' : accent === 'purple' ? 'bg-purple-500' : accent === 'blue' ? 'bg-blue-500' : 'bg-red-500'
      }`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${accentMap[accent]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            <ArrowUpRight size={10} className={trendUp ? '' : 'rotate-90'} />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
};

const DashboardView: React.FC<{
  clients: Client[];
  posts: any[];
  onDeletePost: (postId: string) => void;
  isLoadingClients: boolean;
  isLoadingPosts: boolean;
  onDataRefresh: () => void;
}> = ({
  clients = [],
  posts = [],
  onDeletePost,
  isLoadingClients,
  isLoadingPosts,
  onDataRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalClients = clients.length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
  const totalPosts = posts.length;
  const completionRate = totalPosts > 0 ? Math.round((scheduledPosts / totalPosts) * 100) : 0;
  const industries = new Set(clients.map(c => c.industry)).size;

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentActivity = posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-black p-5 md:p-8 max-w-7xl mx-auto w-full relative">
      {/* Ambient background glows */}
      <div className="fixed top-20 right-20 w-72 h-72 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-60 w-72 h-72 bg-cyan-600/6 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium uppercase tracking-widest">Live Overview</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your social media command center</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDataRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all hover:bg-gray-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link to="/add-client">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-900/20">
              <Plus size={16} />
              Add Client
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={18} className="text-cyan-400" />}
          label="Total Clients"
          value={totalClients}
          trend="+12%"
          trendUp
          accent="cyan"
        />
        <StatCard
          icon={<Calendar size={18} className="text-purple-400" />}
          label="Scheduled Posts"
          value={scheduledPosts}
          trend="+5%"
          trendUp
          accent="purple"
        />
        <StatCard
          icon={<FileText size={18} className="text-blue-400" />}
          label="Total Posts"
          value={totalPosts}
          trend={`${completionRate}% active`}
          trendUp={completionRate > 50}
          accent="blue"
        />
        <StatCard
          icon={<Briefcase size={18} className="text-red-400" />}
          label="Industries"
          value={industries}
          accent="red"
        />
      </div>

      {/* Quick Access Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/content-lab', icon: <Sparkles size={18} />, label: 'Content Lab', color: 'from-cyan-600/20 to-cyan-800/10 border-cyan-700/30 hover:border-cyan-500/50 text-cyan-400' },
          { to: '/templates', icon: <Star size={18} />, label: 'Templates', color: 'from-purple-600/20 to-purple-800/10 border-purple-700/30 hover:border-purple-500/50 text-purple-400' },
          { to: '/clients', icon: <Users size={18} />, label: 'All Clients', color: 'from-blue-600/20 to-blue-800/10 border-blue-700/30 hover:border-blue-500/50 text-blue-400' },
          { to: '/prompt-guide', icon: <Zap size={18} />, label: 'Prompt Guide', color: 'from-red-600/20 to-red-800/10 border-red-700/30 hover:border-red-500/50 text-red-400' },
        ].map(item => (
          <Link key={item.to} to={item.to}>
            <div className={`bg-gradient-to-br ${item.color} border rounded-xl p-4 flex items-center gap-3 transition-all group cursor-pointer hover:scale-[1.02]`}>
              <div className={item.color.split(' ').find(c => c.startsWith('text')) || 'text-gray-400'}>{item.icon}</div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
              <ChevronRight size={14} className="ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients Panel */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Recent Clients</h2>
              <span className="text-xs text-gray-600 ml-1">({filteredClients.length})</span>
            </div>
            <Link to="/clients" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoadingClients ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : filteredClients.length > 0 ? (
              <div className="space-y-2">
                {filteredClients.slice(0, 6).map(client => (
                  <Link key={client.id} to={`/client/${client.id}`}>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/30 hover:border-cyan-500/30 rounded-xl transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                          {client.logo
                            ? <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                            : <Building2 size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.industry || 'No industry'}</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4 border border-gray-700">
                  <Users size={24} className="text-gray-600" />
                </div>
                <h3 className="text-base font-medium text-white mb-1">No clients yet</h3>
                <p className="text-gray-500 text-sm mb-4">Start by adding your first client</p>
                <Link to="/add-client">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl text-sm font-semibold">
                    <Plus size={16} /> Add First Client
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Social Platform Stats Card */}
          <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-purple-400" />
              <h2 className="text-base font-semibold text-white">Platform Stats</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Instagram', color: 'from-pink-500 to-purple-500', pct: 68 },
                { name: 'LinkedIn', color: 'from-blue-400 to-blue-600', pct: 45 },
                { name: 'Twitter/X', color: 'from-gray-300 to-gray-500', pct: 32 },
                { name: 'Facebook', color: 'from-blue-500 to-indigo-600', pct: 21 },
              ].map(p => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{p.name}</span>
                    <span className="text-gray-500">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${p.color} rounded-full`}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <Clock size={16} className="text-blue-400" />
              <h2 className="text-base font-semibold text-white">Recent Posts</h2>
            </div>
            <div className="p-4">
              {isLoadingPosts ? (
                <div className="flex justify-center py-6"><LoadingSpinner /></div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map(post => (
                    <div key={post.id} className="p-3 bg-gray-800/50 border border-gray-700/30 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          post.platform === 'Instagram' ? 'bg-pink-900/30 text-pink-400' :
                          post.platform === 'LinkedIn' ? 'bg-blue-900/30 text-blue-400' :
                          post.platform === 'Twitter' ? 'bg-sky-900/30 text-sky-400' :
                          'bg-purple-900/30 text-purple-400'
                        }`}>
                          {post.platform}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{post.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          post.status === 'scheduled'
                            ? 'bg-green-900/20 text-green-400 border-green-800/50'
                            : 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50'
                        }`}>
                          {post.status}
                        </span>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-0.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText size={28} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-8 bg-gradient-to-r from-gray-900 via-purple-950/30 to-gray-900 border border-purple-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-purple-500/20 flex items-center justify-center">
            <Sparkles size={22} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Ready to generate content?</h3>
            <p className="text-sm text-gray-500">Use AI to create platform-specific posts instantly</p>
          </div>
        </div>
        <Link to="/content-lab">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 whitespace-nowrap">
            <Sparkles size={16} />
            Open Content Lab
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardView;
