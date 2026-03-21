import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Client, Post } from '~/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Users, Search, Plus, Building2, Briefcase, ExternalLink,
  Calendar, FileText, Zap,
  ArrowUpRight, Clock, Star, ChevronRight, Sparkles,
  RefreshCw, FlaskConical, HelpCircle
} from 'lucide-react';

/* ─── Stat Card ─────────────────────────────────────────────── */
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  glowColor: string;
  borderColor: string;
  iconBg: string;
}> = ({ icon, label, value, trend, trendUp, glowColor, borderColor, iconBg }) => (
  <div className="relative rounded-2xl p-5 overflow-hidden group hover:scale-[1.02] transition-all duration-300"
    style={{ background: 'linear-gradient(135deg, #0a1628 0%, #080d1f 100%)', border: `1px solid ${borderColor}` }}>
    {/* corner glow */}
    <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none"
      style={{ background: glowColor }} />
    {/* top line accent */}
    <div className="absolute top-0 left-4 right-4 h-px opacity-60"
      style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }} />

    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl" style={{ background: iconBg, border: `1px solid ${borderColor}` }}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}
          style={{ background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${trendUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <ArrowUpRight size={9} className={trendUp ? '' : 'rotate-90'} />
          {trend}
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</div>
    <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>{label}</div>
  </div>
);

/* ─── Quick Action Tile ──────────────────────────────────────── */
const QuickTile: React.FC<{ to: string; icon: React.ReactNode; label: string; sub: string; color: string; glow: string }> =
  ({ to, icon, label, sub, color, glow }) => (
    <Link to={to}>
      <div className="relative rounded-xl p-4 overflow-hidden group hover:scale-[1.02] transition-all duration-200 cursor-pointer"
        style={{ background: 'rgba(10,22,40,0.9)', border: `1px solid ${color}` }}>
        <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full blur-xl opacity-30 pointer-events-none" style={{ background: glow }} />
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg" style={{ background: `${glow}18`, border: `1px solid ${color}` }}>{icon}</div>
          <ChevronRight size={13} style={{ color }} className="mt-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p className="text-[13px] font-semibold text-white mb-0.5">{label}</p>
        <p className="text-[11px]" style={{ color: 'rgba(148,163,184,0.5)' }}>{sub}</p>
      </div>
    </Link>
  );

/* ─── Dashboard ──────────────────────────────────────────────── */
const DashboardView: React.FC<{
  clients: Client[];
  posts: Post[];
  onDeletePost: (postId: string) => void;
  isLoadingClients: boolean;
  isLoadingPosts: boolean;
  onDataRefresh: () => void;
}> = ({ clients = [], posts = [], onDeletePost, isLoadingClients, isLoadingPosts, onDataRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  const displayName = currentUser?.profile?.displayName || currentUser?.email?.split('@')[0] || 'there';
  const totalClients = clients.length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
  const totalPosts = posts.length;
  const industries = new Set(clients.map(c => c.industry)).size;

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentPosts = posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen w-full relative" style={{ background: 'linear-gradient(135deg, #060b18 0%, #070c1a 60%, #08091a 100%)' }}>

      {/* Ambient glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-1/4 left-1/3 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed top-1/3 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,58,120,0.3)' }}>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#3b82f6' }}>Live Overview</span>
          </div>
          <h1 className="text-xl font-bold text-white leading-none">
            Welcome Back, <span style={{ color: '#60a5fa' }}>{displayName}</span>
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
            {totalClients > 0 ? `Managing ${totalClients} client${totalClients !== 1 ? 's' : ''}` : 'Your AI-powered command center'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(99,179,237,0.4)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="text-sm pl-9 pr-4 py-2 rounded-xl outline-none w-48 transition-all focus:w-64"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,58,120,0.4)', color: '#e2e8f0' }}
            />
          </div>

          {/* Refresh */}
          <button onClick={onDataRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,58,120,0.4)', color: 'rgba(148,163,184,0.7)' }}>
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Client */}
          <Link to="/add-client">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
              <Plus size={14} /> New Client
            </button>
          </Link>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Users size={17} style={{ color: '#60a5fa' }} />} label="Total Clients" value={totalClients}
            trend="+12%" trendUp glowColor="#3b82f6" borderColor="rgba(59,130,246,0.2)" iconBg="rgba(59,130,246,0.08)" />
          <StatCard icon={<Calendar size={17} style={{ color: '#a78bfa' }} />} label="Scheduled" value={scheduledPosts}
            trend="+5%" trendUp glowColor="#7c3aed" borderColor="rgba(124,58,237,0.2)" iconBg="rgba(124,58,237,0.08)" />
          <StatCard icon={<FileText size={17} style={{ color: '#f472b6' }} />} label="Total Posts" value={totalPosts}
            glowColor="#ec4899" borderColor="rgba(236,72,153,0.2)" iconBg="rgba(236,72,153,0.08)" />
          <StatCard icon={<Briefcase size={17} style={{ color: '#fb7185' }} />} label="Industries" value={industries}
            glowColor="#e11d48" borderColor="rgba(225,29,72,0.2)" iconBg="rgba(225,29,72,0.08)" />
        </div>

        {/* ── Quick Actions ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <QuickTile to="/content-lab" icon={<FlaskConical size={16} style={{ color: '#60a5fa' }} />}
            label="Content Lab" sub="Generate AI posts" color="rgba(59,130,246,0.25)" glow="#3b82f6" />
          <QuickTile to="/templates" icon={<Star size={16} style={{ color: '#a78bfa' }} />}
            label="Templates" sub="Ready-to-use prompts" color="rgba(124,58,237,0.25)" glow="#7c3aed" />
          <QuickTile to="/clients" icon={<Users size={16} style={{ color: '#f472b6' }} />}
            label="All Clients" sub="Manage brand kits" color="rgba(236,72,153,0.25)" glow="#ec4899" />
          <QuickTile to="/prompt-guide" icon={<HelpCircle size={16} style={{ color: '#fb7185' }} />}
            label="Prompt Guide" sub="Craft better prompts" color="rgba(225,29,72,0.25)" glow="#e11d48" />
        </div>

        {/* ── Main Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Clients Panel */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(8,13,31,0.9)', border: '1px solid rgba(30,58,120,0.3)' }}>

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(30,58,120,0.25)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6, #7c3aed)' }} />
                <span className="text-[14px] font-semibold text-white">Recent Clients</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {filteredClients.length}
                </span>
              </div>
              <Link to="/clients" className="flex items-center gap-1 text-[12px] font-medium transition-colors hover:opacity-80" style={{ color: '#3b82f6' }}>
                View All <ChevronRight size={12} />
              </Link>
            </div>

            <div className="p-5">
              {/* Mobile search */}
              <div className="relative mb-4 sm:hidden">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(99,179,237,0.4)' }} />
                <input type="text" placeholder="Search clients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none"
                  style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,58,120,0.4)', color: '#e2e8f0' }} />
              </div>

              {isLoadingClients ? (
                <div className="flex justify-center py-10"><LoadingSpinner /></div>
              ) : filteredClients.length > 0 ? (
                <div className="space-y-2">
                  {filteredClients.slice(0, 7).map(client => (
                    <Link key={client.id} to={`/client/${client.id}`}>
                      <div className="flex items-center justify-between p-3.5 rounded-xl transition-all group cursor-pointer"
                        style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(30,58,120,0.25)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(30,58,120,0.25)')}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{ background: 'rgba(30,58,120,0.3)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            {client.logo
                              ? <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                              : <Building2 size={15} style={{ color: '#60a5fa' }} />}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-white group-hover:text-blue-300 transition-colors">{client.name}</p>
                            <p className="text-[11px]" style={{ color: 'rgba(148,163,184,0.5)' }}>{client.industry || 'No industry'}</p>
                          </div>
                        </div>
                        <ExternalLink size={13} style={{ color: 'rgba(59,130,246,0.3)' }} className="group-hover:!text-blue-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,58,120,0.3)' }}>
                    <Users size={22} style={{ color: 'rgba(59,130,246,0.4)' }} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white mb-1">No clients yet</h3>
                  <p className="text-[12px] mb-5" style={{ color: 'rgba(148,163,184,0.5)' }}>Add your first client to get started</p>
                  <Link to="/add-client">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                      <Plus size={15} /> Add First Client
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Platform Stats */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(8,13,31,0.9)', border: '1px solid rgba(30,58,120,0.3)' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #7c3aed, #e11d48)' }} />
                <span className="text-[14px] font-semibold text-white">Platform Mix</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Instagram', pct: 68, color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
                  { name: 'LinkedIn',  pct: 45, color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
                  { name: 'Twitter/X', pct: 32, color: '#7c3aed', glow: 'rgba(124,58,237,0.4)' },
                  { name: 'Facebook',  pct: 21, color: '#60a5fa', glow: 'rgba(96,165,250,0.4)' },
                ].map(p => (
                  <div key={p.name}>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span style={{ color: 'rgba(148,163,184,0.7)' }}>{p.name}</span>
                      <span style={{ color: p.color }}>{p.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${p.pct}%`, background: p.color, boxShadow: `0 0 8px ${p.glow}` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(8,13,31,0.9)', border: '1px solid rgba(30,58,120,0.3)' }}>
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid rgba(30,58,120,0.25)' }}>
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #60a5fa, #3b82f6)' }} />
                <span className="text-[14px] font-semibold text-white">Recent Posts</span>
              </div>
              <div className="p-4">
                {isLoadingPosts ? (
                  <div className="flex justify-center py-6"><LoadingSpinner /></div>
                ) : recentPosts.length > 0 ? (
                  <div className="space-y-2">
                    {recentPosts.map(post => {
                      const platColors: Record<string, string> = {
                        Instagram: '#ec4899', LinkedIn: '#3b82f6', Twitter: '#7c3aed', Facebook: '#60a5fa'
                      };
                      const pc = platColors[post.platform] || '#60a5fa';
                      return (
                        <div key={post.id} className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(30,58,120,0.2)' }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: pc, background: `${pc}18`, border: `1px solid ${pc}30` }}>
                              {post.platform}
                            </span>
                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(148,163,184,0.4)' }}>
                              <Clock size={9} />{new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed line-clamp-2 mb-2" style={{ color: 'rgba(203,213,225,0.7)' }}>{post.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                              style={post.status === 'scheduled'
                                ? { color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }
                                : { color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                              {post.status}
                            </span>
                            <button onClick={() => onDeletePost(post.id)} className="transition-colors p-1 rounded hover:bg-red-900/20"
                              style={{ color: 'rgba(148,163,184,0.3)' }}
                              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#f87171')}
                              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(148,163,184,0.3)')}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText size={26} className="mx-auto mb-2" style={{ color: 'rgba(59,130,246,0.25)' }} />
                    <p className="text-[12px]" style={{ color: 'rgba(148,163,184,0.4)' }}>No posts yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        <div className="mt-5 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(90deg, rgba(8,13,31,0.98) 0%, rgba(20,10,40,0.95) 50%, rgba(8,13,31,0.98) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          {/* glow line top */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(59,130,246,0.6), transparent)' }} />

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}>
              <Sparkles size={20} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white">Ready to generate content?</h3>
              <p className="text-[12px]" style={{ color: 'rgba(148,163,184,0.5)' }}>Use AI to create platform-specific posts instantly</p>
            </div>
          </div>

          <Link to="/content-lab">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white whitespace-nowrap transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 0 25px rgba(59,130,246,0.35)' }}>
              <Zap size={15} /> Open Content Lab
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
