import React, { useState } from 'react';
import Button from '../components/Button';

const ContentLabView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = () => {
    setResult(`AI Analysis for: "${prompt}"

Optimized Hook: Are you tired of manual scheduling?

Body: Social StaX automates your workflow with Gemini AI. Efficiency at its finest.

CTA: Try it today! #SocialStax #AI`);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold mb-2 text-red-600">Content Lab</h1>
      <p className="text-gray-400 mb-8">Experiment with AI prompts and refine your brand voice.</p>

      <div className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <label className="block text-sm font-medium text-gray-400 mb-2">Sandbox Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white h-32 outline-none focus:border-red-600"
            placeholder="Type anything here to see how the AI responds..."
          />
          <Button onClick={handleGenerate} className="mt-4">Generate Output</Button>
        </div>

        {result && (
          <div className="bg-gray-900 p-6 rounded-xl border border-red-900/30 animate-fade-in-up">
            <h2 className="text-sm font-bold text-red-500 uppercase mb-4 tracking-widest">AI Response</h2>
            <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLabView;
