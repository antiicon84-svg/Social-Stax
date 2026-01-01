import React, { useState } from 'react';
import { editImage } from '@/hooks/useGeminiAPI';

export default function ImageEditor({ credits, onRefresh }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // TODO: Get the image URL from somewhere
      const imageData = await editImage('some_image_url', prompt);
      setResult(imageData);
      onRefresh();
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded">
      <h2 className="text-xl font-bold text-white mb-4">Image Editor</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the edits you want to make..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4 h-32"
      />
      <button
        onClick={handleGenerate}
        disabled={loading || credits < 1}
        className="bg-red-primary hover:bg-red-dark text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {result && <div className="mt-4 text-white">{result}</div>}
    </div>
  );
}