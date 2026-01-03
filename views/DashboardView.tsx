import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '~/services/dbService';
import { Client } from '~/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { Users, Search, Plus, Building2, Briefcase, ExternalLink, TrendingUp, Calendar, Target, FileText } from 'lucide-react';

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
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Calculate stats
    const totalClients = clients.length;
    const activePosts = posts.filter(post => post.status === 'scheduled').length;
    const totalPosts = posts.length;
    const completionRate = totalPosts > 0 ? Math.round((activePosts / totalPosts) * 100) : 0;

    // Filter clients based on search
    const filteredClients = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get recent activity (last 5 posts)
    const recentActivity = posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your marketing overview.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onDataRefresh} variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            <Link to="/add-client">
              <Button className="shadow-lg shadow-red-900/20">
                <Plus size={18} className="mr-2" />
                Add Client
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{totalClients}</h3>
            <p className="text-gray-400 text-sm">Total Clients</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{activePosts}</h3>
            <p className="text-gray-400 text-sm">Active Posts</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-xs text-green-500 font-medium">{completionRate}%</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{totalPosts}</h3>
            <p className="text-gray-400 text-sm">Total Posts</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-xs text-purple-500 font-medium">{new Set(clients.map(c => c.industry)).size} Unique</div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{new Set(clients.map(c => c.industry)).size}</h3>
            <p className="text-gray-400 text-sm">Unique Industries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Clients</h2>
                <Link to="/clients" className="text-red-500 hover:text-red-400 text-sm font-medium">
                  View All →
                </Link>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingClients ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="space-y-3">
                  {filteredClients.slice(0, 5).map(client => (
                    <Link
                      key={client.id}
                      to={`/client/${client.id}`}
                      className="block p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400">
                            {client.logo ? (
                              <img src={client.logo} alt={client.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Building2 size={20} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-white group-hover:text-red-400">{client.name}</h3>
                            <p className="text-sm text-gray-400">{client.industry}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No clients yet</h3>
                  <p className="text-gray-400 mb-4">Get started by adding your first client</p>
                  <Link to="/add-client">
                    <Button>
                      <Plus size={18} className="mr-2" />
                      Add First Client
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>

              {isLoadingPosts ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map(post => (
                    <div key={post.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-red-500 uppercase">{post.platform}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'scheduled'
                            ? 'bg-green-900/20 text-green-400 border border-green-800'
                            : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
                          }`}>
                          {post.status}
                        </span>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No activity yet</h3>
                  <p className="text-gray-400">Your recent posts will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

export default DashboardView;
