import React, { useState } from 'react';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { generateContent, enhancePromptWithAI } from '~/services/aiService';
import { savePost } from '~/services/dbService';
import { getCurrentUser } from '~/services/authService';
import { Post } from '~/types';
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
  Send,
  Image as ImageIcon,
  Video,
  FileText,
  Save,
  Download,
  RefreshCw
} from 'lucide-react';

const ContentLabView: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram']);
  const [previewPlatform, setPreviewPlatform] = useState('Instagram');
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video'>('text');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert('Please enter a topic or prompt');
    setIsLoading(true);
    setResult('');
    setGeneratedImageUrl(null);

    try {
      if (activeTab === 'text') {
        const output = await generateContent(topic, previewPlatform);
        setResult(output);
      } else {
        // For Image and Video, we generate a detailed prompt/brief
        const enhanced = await enhancePromptWithAI(topic, activeTab);
        const finalResult = typeof enhanced === 'string'
          ? enhanced
          : `**Enhanced Prompt:**\n${enhanced.enhancedPrompt}\n\n**Technical Parameters:**\n${enhanced.technicalParams}`;
        setResult(finalResult);

        // For image tab, also generate an actual image using Pollinations
        if (activeTab === 'image') {
          await generateActualImage(enhanced);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateActualImage = async (enhancedPrompt: any) => {
    setIsGeneratingImage(true);
    try {
      const promptText = typeof enhancedPrompt === 'string'
        ? enhancedPrompt
        : enhancedPrompt.enhancedPrompt;

      // Use Pollinations API for free image generation
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=1024&height=1024&model=flux&nologo=true`;

      // Create an image element to preload and verify
      const img = new Image();
      img.onload = () => {
        setGeneratedImageUrl(imageUrl);
        setIsGeneratingImage(false);
      };
      img.onerror = () => {
        console.error('Image generation failed');
        setIsGeneratingImage(false);
        // Don't show alert here, let it fail silently and just show the prompt
      };
      img.src = imageUrl;

    } catch (error) {
      console.error('Image generation error:', error);
      setIsGeneratingImage(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!result) return;
    const user = currentUser;
    if (!user) return alert('You must be logged in to save drafts.');

    setIsSaving(true);
    try {
      const newPost: Post = {
        id: '', // dbService handles ID generation
        clientId: 'global', // 'global' or allow user to select client. For now 'global' or user's own draft
        ownerEmail: user.email || '',
        platform: selectedPlatforms[0] as any,
        content: result,
        status: 'draft',
        scheduledAt: new Date(),
        createdAt: new Date(),
        format: activeTab === 'video' ? 'Reel' : activeTab === 'image' ? 'Feed' : undefined,
        imageUrl: generatedImageUrl || undefined
      };
      await savePost(newPost);
      alert('Saved to drafts!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshImage = () => {
    if (!result) return;
    generateActualImage(result);
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

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-800 pb-1">
        {[
          { id: 'text', label: 'Text Post', icon: FileText },
          { id: 'image', label: 'Image Gen', icon: ImageIcon },
          { id: 'video', label: 'Video Gen', icon: Video },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors relative top-[1px] ${activeTab === tab.id
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-500 hover:text-white'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
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
                  onClick={() => setSelectedPlatforms(prev => prev.includes(p.name) ? prev.filter(plat => plat !== p.name) : [...prev, p.name])}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all ${selectedPlatforms.includes(p.name)
                    ? 'bg-red-600/10 border-red-600/50 text-white'
                    : 'bg-black border-gray-800 text-gray-500 hover:border-gray-700'
                    }`}
                >
                  <p.icon size={16} className={selectedPlatforms.includes(p.name) ? p.color : ''} />
                  <span className="text-xs font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Topic / Context</label>
              <button onClick={() => setTopic('')} className="text-gray-600 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white h-40 outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none text-sm leading-relaxed"
              placeholder={activeTab === 'image'
                ? "e.g. A futuristic cyberpunk cityscape at night with neon lights reflecting on wet streets, ultra-realistic 8k"
                : "e.g. Benefits of sustainable fashion for Gen Z, or a product launch for a new tech gadget..."
              }
            />
            <Button
              onClick={handleGenerate}
              isLoading={isLoading || isGeneratingImage}
              className="w-full py-4 shadow-xl shadow-red-900/20"
            >
              <Sparkles size={18} className="mr-2" />
              {activeTab === 'image' ? 'Generate Image' : 'Generate Content'}
            </Button>
          </section>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-3">
          <div className={`h-full min-h-[400px] bg-gray-950 border border-gray-800 rounded-3xl p-8 relative flex flex-col transition-all ${!result && !isLoading && !generatedImageUrl ? 'items-center justify-center border-dashed' : ''}`}>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">
                  {activeTab === 'image' && isGeneratingImage ? 'Generating image...' : 'Consulting Gemini Flash...'}
                </p>
              </div>
            ) : generatedImageUrl && activeTab === 'image' ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase">Generated</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleRefreshImage} className="text-gray-400 hover:text-white">
                      <RefreshCw size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownloadImage} className="text-gray-400 hover:text-white">
                      <Download size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={generatedImageUrl}
                    alt="Generated content"
                    className="max-w-full max-h-[300px] rounded-xl shadow-lg"
                  />
                </div>
                {result && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Prompt used:</p>
                    <p className="text-xs text-gray-400 italic max-h-20 overflow-y-auto">{result}</p>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-900 flex justify-end gap-3">
                  <Button variant="ghost" onClick={handleSaveDraft} isLoading={isSaving} className="gap-2 text-gray-400 hover:text-white">
                    <Save size={14} /> Save Draft
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Send size={14} /> Use in Campaign
                  </Button>
                </div>
              </>
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
                <div className="mt-8 pt-6 border-t border-gray-900 flex justify-end gap-3">
                  <Button variant="ghost" onClick={handleSaveDraft} isLoading={isSaving} className="gap-2 text-gray-400 hover:text-white">
                    <Save size={14} /> Save Draft
                  </Button>
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
                  <h3 className="text-white font-bold mb-1">
                    {activeTab === 'image' ? 'Images will appear here' : 'Results will appear here'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {activeTab === 'image'
                      ? "Select a platform and enter a prompt to generate AI images."
                      : "Select a platform and enter a topic to start generating AI content."
                    }
                  </p>
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
