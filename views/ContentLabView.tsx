import React, { useState } from 'react';
import Button from '@/components/Button';
import { generateContent } from '~/services/aiService';
import { 
  FlaskConical, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Send
} from 'lucide-react';

const ContentLabView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert('Please enter a topic or prompt');
    setIsLoading(true);
    setResult('');
    try {
      const output = await generateContent(topic, platform);
      setResult(output);
    } catch (error) {
      console.error(error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-400' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="text-red-500" size={28} />
          <h1 className="text-3xl font-bold text-white">Content Lab</h1>
        </div>
        <p className="text-gray-400">Experiment with AI to generate high-performing social media content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Target Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPlatform(p.name)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all ${
                    platform === p.name 
                      ? 'bg-red-600/10 border-red-600/50 text-white' 
                      : 'bg-black border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <p.icon size={16} className={platform === p.name ? p.color : ''} />
                  <span className="text-xs font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Topic / Context</label>
              <button onClick={() => setTopic('')} className="text-gray-600 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white h-40 outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none text-sm leading-relaxed"
              placeholder="e.g. Benefits of sustainable fashion for Gen Z, or a product launch for a new tech gadget..."
            />
            <Button 
              onClick={handleGenerate} 
              isLoading={isLoading}
              className="w-full py-4 shadow-xl shadow-red-900/20"
            >
              <Sparkles size={18} className="mr-2" />
              Generate Content
            </Button>
          </section>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-3">
          <div className={`h-full min-h-[400px] bg-gray-950 border border-gray-800 rounded-3xl p-8 relative flex flex-col transition-all ${!result && !isLoading ? 'items-center justify-center border-dashed' : ''}`}>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Consulting Gemini Flash...</p>
              </div>
            ) : result ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase">Ready</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
                <div className="prose prose-invert max-w-none flex-1 overflow-auto custom-scrollbar">
                  <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans italic">
                    {result}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-900 flex justify-end">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Send size={14} /> Use in Campaign
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 max-w-xs">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto border border-gray-800 text-gray-700">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Results will appear here</h3>
                  <p className="text-gray-500 text-sm">Select a platform and enter a topic to start generating AI content.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentLabView;