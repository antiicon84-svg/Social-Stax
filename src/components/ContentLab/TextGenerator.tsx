import React, { useState } from 'react';
import { generateTextContent } from '@/hooks/useGeminiAPI';

interface TextGeneratorProps {
  credits: number;
  onRefresh: () => void;
}

const PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter', 'Facebook', ''];

export default function TextGenerator({ credits, onRefresh }: TextGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const text = await generateTextContent(topic.trim(), platform || undefined);
      setResult(text);
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Content generation failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded">
      <h2 className="text-xl font-bold text-white mb-4">Text Generator</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic for your social media post..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4"
        disabled={loading}
      />
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-1">Platform (optional)</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 text-white"
          disabled={loading}
        >
          <option value="">Any platform</option>
          {PLATFORMS.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading || credits < 1 || !topic.trim()}
        className="bg-red-primary hover:bg-red-dark text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Content'}
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <h3 className="text-white font-semibold mb-2">Generated Content</h3>
          <p className="text-gray-200 whitespace-pre-wrap text-sm">{result}</p>
        </div>
      )}
    </div>
  );
}
