import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import TextToImage from './TextToImage';
import ImageEditor from './ImageEditor';
import VideoGenerator from './VideoGenerator';

export default function ContentLab() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'image' | 'edit' | 'video'>('image');
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) loadCredits();
  }, [currentUser]);

  const loadCredits = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCredits(data.credits - data.creditsUsed);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading credits:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Content Lab</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            activeTab === 'image' ? 'bg-red-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Text to Image
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            activeTab === 'edit' ? 'bg-red-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Edit Image
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            activeTab === 'video' ? 'bg-red-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Generate Video
        </button>
        <div className="ml-auto text-white text-lg font-semibold">
          Credits Available: {credits}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <>
          {activeTab === 'image' && <TextToImage credits={credits} onRefresh={loadCredits} />}
          {activeTab === 'edit' && <ImageEditor credits={credits} onRefresh={loadCredits} />}
          {activeTab === 'video' && <VideoGenerator credits={credits} onRefresh={loadCredits} />}
        </>
      )}
    </div>
  );
}