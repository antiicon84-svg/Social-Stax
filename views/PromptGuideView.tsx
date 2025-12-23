import React, { useState } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Video, 
  Camera, 
  Zap, 
  Palette, 
  Move, 
  Sparkles, 
  Scissors, 
  Smile, 
  Layers, 
  Image as ImageIcon, 
  X, 
  Trash2, 
  Wand2, 
  Fingerprint, 
  CheckCircle 
} from 'lucide-react';
import Button from '../components/Button';
import { analyzePromptCoherence, enhancePromptWithAI } from '../services/aiService';

interface PromptItem {
  label: string;
  prompt: string;
  conflicts?: string[]; // IDs or labels of items this conflicts with
}

interface PromptCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  items: PromptItem[];
  type: 'video' | 'image' | 'both';
}

const VIDEOCATEGORIES: PromptCategory[] = [
  {
    id: 'realism',
    title: 'Realism & Imperfections',
    icon: Fingerprint,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/30',
    type: 'video',
    items: [
      { label: 'Raw Footage', prompt: 'Raw footage style, uncolorgraded, natural contrast' },
      { label: 'Phone Camera', prompt: 'Shot on iPhone, vertical video, casual social media vibe' },
      { label: 'Dirty Lens', prompt: 'Dirty lens effect, slight smudges, realistic glare, lens dust' },
      { label: 'Light Leaks', prompt: 'Vintage light leaks and film burns flashing across frame' },
      { label: 'Film Grain', prompt: 'Heavy film grain, Super 8mm texture, analog look' },
      { label: 'VHS', prompt: 'VHS tape artifacting, magnetic glitch, tracking error, 1990s home video' },
      { label: 'Handheld Shake', prompt: 'Handheld camera with slight accidental shake, autofocus hunting' },
    ]
  },
  {
    id: 'camera',
    title: 'Camera Movement',
    icon: Camera,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    type: 'video',
    items: [
      { label: 'Snorricam', prompt: 'Snorricam chest-mount, subject locked in center while background moves' },
      { label: 'Crash Zoom', prompt: 'Sudden, rapid crash zoom into subject face' },
      { label: 'Rack Focus', prompt: 'Cinematic rack focus shifting sharp focus from foreground to background' },
      { label: 'Dolly Zoom', prompt: 'Dolly zoom effect Vertigo effect, background expands while subject stays same size' },
      { label: 'Pan Right', prompt: 'Camera pans slowly to the right' },
      { label: 'Tilt Up', prompt: 'Camera tilts up from ground to sky' },
      { label: 'FPV Drone', prompt: 'Fast FPV drone shot flying through gaps' },
      { label: 'Orbit', prompt: '360-degree orbit around character' },
    ]
  },
  {
    id: 'physics',
    title: 'Physics & Motion',
    icon: Move,
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-500/30',
    type: 'video',
    items: [
      { label: 'Bullet Time', prompt: 'Bullet time effect, frozen time while camera moves around subject' },
      { label: 'Slow Motion', prompt: 'Super slow motion, 240fps, detailed fluid dynamics' },
      { label: 'Time-lapse', prompt: 'Time-lapse, fast moving clouds, traffic trails' },
      { label: 'Explosion', prompt: 'Detailed debris explosion with smoke and particles' },
      { label: 'Morphing', prompt: 'Object seamlessly transforms morphs into another' },
      { label: 'Loop', prompt: 'Perfectly seamless loop' },
    ]
  }
];

const IMAGECATEGORIES: PromptCategory[] = [
  {
    id: 'composition',
    title: 'Composition',
    icon: Layers,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/30',
    type: 'image',
    items: [
      { label: 'Wide Angle', prompt: 'Wide angle shot, 24mm lens' },
      { label: 'Telephoto', prompt: 'Telephoto shot, 85mm lens, compressed background' },
      { label: 'Macro', prompt: 'Macro photography, extreme close-up detail' },
      { label: 'Aerial', prompt: 'Aerial drone view looking down' },
      { label: 'Low Angle', prompt: 'Low angle shot looking up, imposing' },
      { label: 'Bokeh', prompt: 'Depth of field, blurry background, bokeh' },
      { label: 'Rule of Thirds', prompt: 'Rule of thirds composition' },
    ]
  },
  {
    id: 'texture',
    title: 'Texture & Quality',
    icon: Sparkles,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-500/30',
    type: 'image',
    items: [
      { label: '8K', prompt: '8k resolution, highly detailed' },
      { label: 'Grainy', prompt: 'Film grain, noise, vintage texture' },
      { label: 'Smooth', prompt: 'Smooth, clean, digital art style' },
      { label: 'Matte', prompt: 'Matte painting style' },
      { label: 'Glossy', prompt: 'Glossy reflections, wet surface' },
      { label: 'Impasto', prompt: 'Thick impasto oil paint texture' },
    ]
  }
];

const SHAREDCATEGORIES: PromptCategory[] = [
  {
    id: 'lighting',
    title: 'Lighting',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/30',
    type: 'both',
    items: [
      { label: 'Golden Hour', prompt: 'Warm golden hour sunlight' },
      { label: 'Blue Hour', prompt: 'Cool blue hour ambiance' },
      { label: 'Cinematic', prompt: 'Dramatic cinematic lighting, rim light' },
      { label: 'Neon', prompt: 'Bright neon signs, cyberpunk lighting' },
      { label: 'Rembrandt', prompt: 'Rembrandt lighting, chiaroscuro' },
      { label: 'Silhouette', prompt: 'Subject silhouetted against light' },
    ]
  },
  {
    id: 'style',
    title: 'Visual Style',
    icon: Palette,
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/30',
    type: 'both',
    items: [
      { label: 'Photorealistic', prompt: 'Photorealistic, 35mm film' },
      { label: 'Vintage', prompt: 'Vintage 16mm film, retro aesthetic' },
      { label: 'Anime', prompt: 'High quality anime style, vibrant' },
      { label: 'Cyberpunk', prompt: 'Cyberpunk sci-fi aesthetic' },
      { label: 'Minimalist', prompt: 'Minimalist, clean lines, negative space' },
      { label: 'Watercolor', prompt: 'Watercolor painting, ink bleed' },
    ]
  }
];

const PromptGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
  const [searchTerm, setSearchTerm] = useState('');
  const [builderSegments, setBuilderSegments] = useState<PromptItem[]>([]);
  const [baseSubject, setBaseSubject] = useState('');
  
  const [advice, setAdvice] = useState<{ score: number; advice: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{ enhancedPrompt: string; technicalParams: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [...(activeTab === 'video' ? VIDEOCATEGORIES : IMAGECATEGORIES), ...SHAREDCATEGORIES];
  const fullPrompt = `${baseSubject} ${builderSegments.map(s => s.prompt).join(', ')}`.trim();

  const filteredCategories = categories.filter(cat => {
    if (cat.type !== 'both' && cat.type !== activeTab) return false;
    if (!searchTerm) return true;
    return cat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           cat.items.some(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const toggleSegment = (item: PromptItem) => {
    if (builderSegments.find(s => s.label === item.label)) {
      setBuilderSegments(prev => prev.filter(s => s.label !== item.label));
    } else {
      setBuilderSegments(prev => [...prev, item]);
    }
  };

  const handleCopy = () => {
    const textToCopy = enhancedResult ? enhancedResult.enhancedPrompt : fullPrompt;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnhance = async () => {
    if (!fullPrompt) return alert('Start building a prompt first!');
    setIsEnhancing(true);
    try {
      const result = await enhancePromptWithAI(fullPrompt, activeTab);
      setEnhancedResult(result);
    } catch (e) {
      alert('Failed to enhance prompt.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!fullPrompt) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzePromptCoherence(fullPrompt, activeTab);
      setAdvice(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto h-full flex flex-col pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 italic">Prompt Engineering Guide</h1>
        <p className="text-gray-400">Build professional prompts using industry-standard techniques.</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('video')}
          className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'}`}
        >
          <Video className="mr-2 h-5 w-5" /> Video Prompts
        </button>
        <button 
          onClick={() => setActiveTab('image')}
          className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'image' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'}`}
        >
          <ImageIcon className="mr-2 h-5 w-5" /> Image Prompts
        </button>
      </div>

      {/* Prompt Builder Box */}
      <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6 mb-8 sticky top-4 z-30 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
            <Wand2 className="h-4 w-4 mr-2" /> Prompt Builder
          </h2>
          <Button variant="ghost" onClick={() => {
            setBuilderSegments([]);
            setBaseSubject('');
            setEnhancedResult(null);
            setAdvice(null);
          }} className="text-xs h-8 text-gray-600 hover:text-red-500">
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>

        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Start with your main subject e.g. A futuristic cyberpunk city..." 
            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none mb-3"
            value={baseSubject}
            onChange={(e) => setBaseSubject(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-black/50 rounded-xl border border-gray-900">
            {builderSegments.length === 0 && !baseSubject && (
              <span className="text-gray-700 text-sm italic">Select tags below to build your prompt...</span>
            )}
            {builderSegments.map((seg, idx) => (
              <span key={idx} className="bg-red-600/10 text-red-500 border border-red-600/20 px-3 py-1 rounded-full text-xs flex items-center">
                {seg.label}
                <button onClick={() => toggleSegment(seg)} className="ml-2 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-t border-gray-900 pt-4">
          <div className="text-xs text-gray-600 font-mono flex-grow break-all bg-black p-2 rounded border border-gray-900">
            {fullPrompt || 'Empty prompt...'}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={handleAnalyze} isLoading={isAnalyzing} className="text-xs py-2">
              <Check className="h-3 w-3 mr-2" /> Check Quality
            </Button>
            <Button onClick={handleEnhance} isLoading={isEnhancing} className="text-xs py-2 bg-purple-600 hover:bg-purple-700">
              <Sparkles className="h-3 w-3 mr-2" /> AI Enhance
            </Button>
            <Button onClick={handleCopy} className="text-xs py-2">
              {copied ? <CheckCircle className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />} Copy
            </Button>
          </div>
        </div>

        {(advice || enhancedResult) && (
          <div className="mt-4 pt-4 border-t border-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4">
            {advice && (
              <div className={`p-3 rounded-xl border ${advice.score > 7 ? 'bg-green-900/10 border-green-500/20' : 'bg-yellow-900/10 border-yellow-500/20'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500">Coherence Score</span>
                  <span className="font-bold text-white">{advice.score}/10</span>
                </div>
                <p className="text-xs text-gray-400">{advice.advice}</p>
              </div>
            )}
            {enhancedResult && (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <span className="text-[10px] font-bold text-purple-400 uppercase mb-1 block">AI Enhanced Version</span>
                <p className="text-xs text-gray-300">{enhancedResult.enhancedPrompt}</p>
                <p className="text-[10px] text-gray-600 mt-1 font-mono">{enhancedResult.technicalParams}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
        <input 
          type="text" 
          placeholder="Search styles, effects, or movements..." 
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="space-y-12">
        {filteredCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${cat.bg} ${cat.color} border ${cat.border}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">{cat.title}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cat.items.map((item, idx) => {
                  const isSelected = builderSegments.some(s => s.label === item.label);
                  return (
                    <button 
                      key={idx}
                      onClick={() => toggleSegment(item)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                        isSelected 
                          ? 'bg-red-600/10 border-red-600 ring-1 ring-red-600' 
                          : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="font-bold text-sm text-gray-200 mb-1 flex justify-between items-start">
                          {item.label}
                          {isSelected && <CheckCircle size={14} className="text-red-500" />}
                        </div>
                        <div className="text-[10px] text-gray-500 leading-relaxed group-hover:text-gray-400 italic">
                          {item.prompt}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromptGuideView;
