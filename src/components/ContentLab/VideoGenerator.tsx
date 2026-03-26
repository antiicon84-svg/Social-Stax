import React from 'react';

interface VideoGeneratorProps {
  credits: number;
  onRefresh: () => void;
}

export default function VideoGenerator({ credits, onRefresh }: VideoGeneratorProps) {
  return (
    <div className="bg-gray-800 p-6 rounded">
      <h2 className="text-xl font-bold text-white mb-4">Video Generator</h2>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
        <p className="text-gray-400 max-w-sm">
          AI video generation powered by Google Veo is currently in development
          and will be available in a future update. Stay tuned!
        </p>
      </div>
    </div>
  );
}
