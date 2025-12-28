import React, { useState, useEffect } from 'react';
import { getClientById, savePost } from '../../services/dbService';
import { Client, Post } from '../types';
import { SOCIAL_PLATFORMS } from '../../src/config/constants';
import Button from '../../src/components/Button';
import LoadingSpinner from '../../src/components/LoadingSpinner';

interface ClientDetailViewProps {
  clientId: string;
  onPostScheduled: () => void;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ clientId, onPostScheduled }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [postTopic, setPostPostTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(SOCIAL_PLATFORMS[0]);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      const data = await getClientById(clientId);
      setClient(data || null);
      setLoading(false);
    };
    fetchClient();
  }, [clientId]);

  const handleSchedulePost = async () => {
    if (!postTopic) return alert('Enter a topic');
    if (!client) return;

    const newPost: Post = {
      id: '',
      clientId: client.id,
      content: `Generated post about ${postTopic} for ${client.name} on ${selectedPlatform}`,
      platform: selectedPlatform,
      scheduledDate: new Date().toISOString(),
      status: 'scheduled'
    };

    await savePost(newPost);
    alert('Post scheduled successfully!');
    setPostPostTopic('');
    onPostScheduled();
  };

  if (loading) return <div className="p-10 text-center"><LoadingSpinner size="lg" /></div>;
  if (!client) return <div className="p-10 text-center text-white">Client not found</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{client.name}</h1>
        <p className="text-red-500 font-medium">{client.industry} • {client.tone} Tone</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Schedule a Post</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Topic</label>
              <textarea 
                value={postTopic}
                onChange={(e) => setPostPostTopic(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white h-24 outline-none focus:border-red-600"
                placeholder="What should the post be about?"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Platform</label>
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-red-600"
              >
                {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Button onClick={handleSchedulePost} className="w-full">Schedule with AI</Button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Brand Guidelines</h2>
          <textarea 
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white h-48 outline-none focus:border-red-600"
            placeholder="Detailed guidelines for this client..."
            defaultValue={client.guidelines}
          />
          <Button variant="secondary" className="mt-4 w-full">Save Guidelines</Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailView;
