import React, { useState, useEffect } from 'react';
import { getClientById, savePost, saveClient, deleteClient } from '~/services/dbService'; // Added saveClient, deleteClient
import { Client, Post, SocialPlatform } from '~/types';
import { SOCIAL_PLATFORMS, INDUSTRY_OPTIONS, BRAND_TONE_OPTIONS } from '@/config/constants';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Check, Edit2, LayoutDashboard, Palette, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientDetailViewProps {
  clientId: string;
  onPostScheduled: () => void;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ clientId, onPostScheduled }) => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');

  // Content Generation State
  const [postTopic, setPostTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['Instagram']);

  // Edit Client State
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const data = await getClientById(clientId);
        if (data) {
          setClient(data);
          setEditedClient(data);
        }
      } catch (error) {
        console.error("Failed to fetch client", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSchedulePost = async () => {
    if (!postTopic) return alert('Enter a topic');
    if (selectedPlatforms.length === 0) return alert('Select at least one platform');
    if (!client) return;

    setIsSaving(true);
    try {
      // Create a post for EACH selected platform
      const promises = selectedPlatforms.map(platform => {
        const newPost: Post = {
          id: '',
          clientId: client.id,
          ownerEmail: client.ownerEmail,
          content: `Generated post about ${postTopic} for ${client.name} on ${platform}`, // Placeholder for AI content
          platform: platform,
          scheduledAt: new Date(),
          status: 'scheduled',
          createdAt: new Date(),
        };
        return savePost(newPost);
      });

      await Promise.all(promises);

      alert(`Successfully scheduled ${selectedPlatforms.length} posts!`);
      setPostTopic('');
      onPostScheduled();
    } catch (error) {
      console.error("Error scheduling posts", error);
      alert('Failed to schedule posts');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClient = async () => {
    if (!editedClient) return;
    setIsSaving(true);
    try {
      await saveClient(editedClient);
      setClient(editedClient);
      alert('Client updated successfully');
    } catch (error) {
      console.error("Error updating client", error);
      alert('Failed to update client');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!window.confirm('Are you sure you want to delete this client? This cannot be undone.')) return;
    setIsSaving(true);
    try {
      await deleteClient(clientId);
      alert('Client deleted successfully');
      navigate('/');
    } catch (error) {
      console.error("Error deleting client", error);
      alert('Failed to delete client');
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><LoadingSpinner size="lg" /></div>;
  if (!client || !editedClient) return <div className="p-10 text-center text-white">Client not found</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full text-white pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-900 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-gray-400 text-sm">{client.industry} • {client.brandTone}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800 mb-8">
        <button
          onClick={() => setActiveTab('generate')}
          className={`pb-4 px-2 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'generate' ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
        >
          <LayoutDashboard size={18} /> Content Generator
          {activeTab === 'generate' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500" />}
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`pb-4 px-2 font-medium flex items-center gap-2 transition-colors relative ${activeTab === 'edit' ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
        >
          <Settings size={18} /> Manage Client & Brand Kit
          {activeTab === 'edit' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500" />}
        </button>
      </div>

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Content Ideas</h2>
              <textarea
                value={postTopic}
                onChange={(e) => setPostTopic(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white min-h-[120px] outline-none focus:ring-2 focus:ring-red-600 text-lg placeholder-gray-600"
                placeholder="What would you like to post about today? (e.g., 'New summer collection launch' or 'Tips for healthy living')"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSchedulePost} disabled={isSaving} size="lg" className="px-8">
                {isSaving ? 'Scheduling...' : 'Generate & Schedule'}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Target Platforms</h3>
              <div className="space-y-2">
                {SOCIAL_PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformToggle(platform as SocialPlatform)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedPlatforms.includes(platform as SocialPlatform)
                      ? 'bg-red-600/10 border-red-500/50 text-white'
                      : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                  >
                    <span className="font-medium">{platform}</span>
                    {selectedPlatforms.includes(platform as SocialPlatform) && <Check size={16} className="text-red-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</h3>
              <p className="text-xs text-gray-500 italic">More AI tools coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TAB */}
      {activeTab === 'edit' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Brand Identity Section */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6 text-red-500">
              <Palette size={20} />
              <h2 className="text-lg font-bold text-white">Brand Visuals</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Logo URL</label>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl border border-gray-800 bg-black flex items-center justify-center overflow-hidden shrink-0">
                    {editedClient.logo ? <img src={editedClient.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-600">No Logo</span>}
                  </div>
                  <input
                    type="text"
                    value={editedClient.logo || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, logo: e.target.value })}
                    className="flex-1 bg-black border border-gray-800 rounded-xl px-4 text-white outline-none focus:ring-1 focus:ring-red-600"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brand Colors</label>
                <div className="flex flex-col gap-3">
                  {/* Primary */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-gray-700" style={{ backgroundColor: editedClient.primaryBrandColor }} />
                    <input
                      type="text"
                      value={editedClient.primaryBrandColor}
                      onChange={(e) => setEditedClient({ ...editedClient, primaryBrandColor: e.target.value })}
                      className="flex-1 bg-black border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      placeholder="Primary Hex"
                    />
                  </div>
                  {/* Secondary */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-gray-700" style={{ backgroundColor: editedClient.secondaryBrandColor || 'transparent' }} />
                    <input
                      type="text"
                      value={editedClient.secondaryBrandColor || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, secondaryBrandColor: e.target.value })}
                      className="flex-1 bg-black border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      placeholder="Secondary Hex"
                    />
                  </div>
                  {/* Accent */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-gray-700" style={{ backgroundColor: editedClient.accentBrandColor || 'transparent' }} />
                    <input
                      type="text"
                      value={editedClient.accentBrandColor || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, accentBrandColor: e.target.value })}
                      className="flex-1 bg-black border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
                      placeholder="Accent Hex"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Details */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-white mb-6">Core Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Client Name</label>
                <input
                  type="text"
                  value={editedClient.name}
                  onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Industry</label>
                <input
                  type="text"
                  value={editedClient.industry}
                  onChange={(e) => setEditedClient({ ...editedClient, industry: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brand Tone</label>
                <select
                  value={editedClient.brandTone}
                  onChange={(e) => setEditedClient({ ...editedClient, brandTone: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-red-600"
                >
                  {BRAND_TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Website</label>
                <input
                  type="text"
                  value={editedClient.website || ''}
                  onChange={(e) => setEditedClient({ ...editedClient, website: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </section>

          {/* Extended Info */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-white mb-6">Strategic Info</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mission Statement</label>
                <textarea
                  value={editedClient.mission || ''}
                  onChange={(e) => setEditedClient({ ...editedClient, mission: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white min-h-[100px] outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Market</label>
                <textarea
                  value={editedClient.targetMarket || ''}
                  onChange={(e) => setEditedClient({ ...editedClient, targetMarket: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white min-h-[100px] outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Additional Notes</label>
                <textarea
                  value={editedClient.additionalNotes || ''}
                  onChange={(e) => setEditedClient({ ...editedClient, additionalNotes: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white min-h-[100px] outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-between pt-4 border-t border-gray-800 mt-8">
            <Button variant="danger" onClick={handleDeleteClient} disabled={isSaving}>
              Delete Client
            </Button>
            <Button onClick={handleSaveClient} disabled={isSaving} size="lg">
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
          <div className="text-center text-xs text-green-500 mt-4 font-mono">
            DEBUG: v2.1 Loaded (Tabs + Delete Enabled)
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailView;