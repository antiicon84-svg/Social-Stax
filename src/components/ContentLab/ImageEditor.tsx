import React, { useState } from 'react';
import { editImage } from '@/hooks/useGeminiAPI';

interface ImageEditorProps {
  credits: number;
  onRefresh: () => void;
}

export default function ImageEditor({ credits, onRefresh }: ImageEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || !imageUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const imageData = await editImage(imageUrl, prompt);
      setResult(imageData);
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Image editing failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded">
      <h2 className="text-xl font-bold text-white mb-4">Image Editor</h2>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter image URL to edit..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4"
      />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the edits you want to make..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4 h-32"
      />
      <button
        onClick={handleGenerate}
        disabled={loading || credits < 1 || !imageUrl.trim()}
        className="bg-red-primary hover:bg-red-dark text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4">
          <img src={result} alt="Edited image" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
}
