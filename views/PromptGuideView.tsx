import React, { useState } from 'react';
import { Search, Copy, Check, Video, Camera, Zap, Palette, Move, Sparkles, Scissors, Smile, Layers, Image as ImageIcon, X, Trash2, Wand2, Fingerprint, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import { analyzePromptCoherence, enhancePromptWithAI } from '~/services/aiService';

// Types used internally
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

// --- DATA: VIDEO SPECIFIC ---
const VIDEO_CATEGORIES: PromptCategory[] = [
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
        { label: 'Chromatic Ab.', prompt: 'Chromatic aberration, subtle color fringing at edges' },
        { label: 'GoPro', prompt: 'GoPro wide angle, fisheye distortion, high action POV' },
        { label: 'CCTV', prompt: 'CCTV security camera footage, grainy, high angle, timestamp overlay' },
        { label: 'Dashcam', prompt: 'Dashcam footage, wide angle, windshield reflection' },
        { label: 'News Broadcast', prompt: 'News broadcast style, lower thirds, telephoto lens compression' },
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
        { label: 'Rack Focus', prompt: 'Cinematic rack focus shifting sharp focus from foreground to background subject' },
        { label: 'Dolly Zoom', prompt: 'Dolly zoom effect (Vertigo effect), background expands while subject stays same size' },
        { label: 'Pan Right', prompt: 'Camera pans slowly to the right', conflicts: ['Pan Left'] },
        { label: 'Pan Left', prompt: 'Camera pans steadily to the left', conflicts: ['Pan Right'] },
        { label: 'Tilt Up', prompt: 'Camera tilts up from ground to sky', conflicts: ['Tilt Down'] },
        { label: 'Tilt Down', prompt: 'Camera tilts down from skyline', conflicts: ['Tilt Up'] },
        { label: 'Zoom In', prompt: 'Slow smooth zoom in', conflicts: ['Zoom Out'] },
        { label: 'Zoom Out', prompt: 'Rapid zoom out to reveal environment', conflicts: ['Zoom In'] },
        { label: 'Tracking', prompt: 'Tracking shot keeping pace with subject' },
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
        { label: 'Slow Motion', prompt: 'Super slow motion, 240fps, detailed fluid dynamics', conflicts: ['Time-lapse', 'Speed Ramp'] },
        { label: 'Time-lapse', prompt: 'Time-lapse, fast moving clouds, traffic trails', conflicts: ['Slow Motion'] },
        { label: 'Fluid Sim', prompt: 'Water splashing in zero gravity, liquid simulation' },
        { label: 'Explosion', prompt: 'Detailed debris explosion with smoke and particles' },
        { label: 'Wind/Cloth', prompt: 'Wind blowing through hair and fabric' },
        { label: 'Morphing', prompt: 'Object seamlessly transforms (morphs) into another' },
        { label: 'Loop', prompt: 'Perfectly seamless loop' },
        { label: 'Reverse', prompt: 'Time reversed physics' },
    ]
  },
  {
    id: 'editing',
    title: 'Editing & Transitions',
    icon: Scissors,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    type: 'video',
    items: [
        { label: 'Match Cut', prompt: 'Match cut seamless transition based on shape' },
        { label: 'Zoom Through', prompt: 'Camera zooms through object to new scene' },
        { label: 'Object Wipe', prompt: 'Object passes wiping frame to new scene' },
        { label: 'Split Screen', prompt: 'Split screen showing two dimensions' },
        { label: 'Invisible Cut', prompt: 'Invisible cut past dark pillar' },
        { label: 'Speed Ramp', prompt: 'Speed ramp from fast to slow motion' },
    ]
  },
   {
    id: 'viral',
    title: 'Viral / Meme',
    icon: Smile,
    color: 'text-pink-400',
    bg: 'bg-pink-900/20',
    border: 'border-pink-500/30',
    type: 'video',
    items: [
        { label: 'Dancing Cat', prompt: 'A fluffy cat wearing headphones DJing at a massive festival' },
        { label: 'Space Walk', prompt: 'An astronaut moonwalking on Mars' },
        { label: 'Food Transform', prompt: 'A burger morphing seamlessly into a race car' },
        { label: 'Tiny World', prompt: 'Tilt-shift miniature toy set view' },
        { label: 'Infinite Zoom', prompt: 'Infinite zoom into a cup of coffee' },
        { label: 'Retro Gaming', prompt: '8-bit pixel art character in real world' },
    ]
  }
];

// --- DATA: IMAGE SPECIFIC ---
const IMAGE_CATEGORIES: PromptCategory[] = [
  {
    id: 'composition',
    title: 'Composition',
    icon: Layers,
    color: 'text-indigo-400',
    bg: 'bg-indigo-900/20',
    border: 'border-indigo-500/30',
    type: 'image',
    items: [
        { label: 'Wide Angle', prompt: 'Wide angle shot, 24mm lens', conflicts: ['Macro', 'Telephoto'] },
        { label: 'Telephoto', prompt: 'Telephoto shot, 85mm lens, compressed background', conflicts: ['Wide Angle'] },
        { label: 'Macro', prompt: 'Macro photography, extreme close-up detail', conflicts: ['Wide Angle', 'Aerial'] },
        { label: 'Aerial', prompt: 'Aerial drone view looking down', conflicts: ['Macro', 'Low Angle'] },
        { label: 'Low Angle', prompt: 'Low angle shot looking up, imposing', conflicts: ['Aerial', 'High Angle'] },
        { label: 'High Angle', prompt: 'High angle shot looking down', conflicts: ['Low Angle'] },
        { label: 'Bokeh', prompt: 'Depth of field, blurry background, bokeh' },
        { label: 'Symmetrical', prompt: 'Perfectly symmetrical composition' },
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
        { label: 'Grainy', prompt: 'Film grain, noise, vintage texture', conflicts: ['Clean', 'Smooth'] },
        { label: 'Smooth', prompt: 'Smooth, clean, digital art style', conflicts: ['Grainy'] },
        { label: 'Matte', prompt: 'Matte painting style' },
        { label: 'Glossy', prompt: 'Glossy reflections, wet surface' },
        { label: 'Impasto', prompt: 'Thick impasto oil paint texture' },
    ]
  }
];

// --- DATA: SHARED (LIGHTING / STYLE) ---
const SHARED_CATEGORIES: PromptCategory[] = [
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
        { label: 'Volumetric', prompt: 'God rays, volumetric fog' },
        { label: 'Neon', prompt: 'Bright neon signs, cyberpunk lighting' },
        { label: 'Studio', prompt: 'Soft studio lighting, high key' },
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
        { label: '3D Render', prompt: 'Pixar style 3D render, subsurface scattering' },
        { label: 'Claymation', prompt: 'Stop motion claymation, plasticine' },
        { label: 'Cyberpunk', prompt: 'Cyberpunk sci-fi aesthetic' },
        { label: 'Minimalist', prompt: 'Minimalist, clean lines, negative space' },
        { label: 'Watercolor', prompt: 'Watercolor painting, ink bleed' },
        { label: 'VFX', prompt: 'VFX, glitch art, datamosh' },
    ]
  }
];

const PromptGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Builder State
  const [builderSegments, setBuilderSegments] = useState<PromptItem[]>([]);
  const [baseSubject, setBaseSubject] = useState('');
  
  // AI State
  const [advice, setAdvice] = useState<{score: number, advice: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{enhancedPrompt: string, technicalParams: string} | null>(null);

  // Derived Data
  const categories = [
    ...(activeTab === 'video' ? VIDEO_CATEGORIES : IMAGE_CATEGORIES),
    ...SHARED_CATEGORIES
  ];

  const fullPrompt = `${baseSubject} ${builderSegments.map(s => s.prompt).join(', ')}`.trim();

  // Filter Categories based on search
  const filteredCategories = categories.filter(cat => {
      if (cat.type !== 'both' && cat.type !== activeTab) return false;
      if (!searchTerm) return true;
      return cat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             cat.items.some(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()) || item.prompt.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const toggleSegment = (item: PromptItem) => {
      if (builderSegments.find(s => s.label === item.label)) {
          setBuilderSegments(prev => prev.filter(s => s.label !== item.label));
      } else {
          // Remove conflicts
          let newSegments = [...builderSegments];
          if (item.conflicts) {
              newSegments = newSegments.filter(s => !item.conflicts?.includes(s.label));
          }
          setBuilderSegments([...newSegments, item]);
      }
  };

  const handleCopy = () => {
      const textToCopy = enhancedResult ? `${enhancedResult.enhancedPrompt} ${enhancedResult.technicalParams}` : fullPrompt;
      navigator.clipboard.writeText(textToCopy);
      alert("Prompt copied to clipboard!");
  };

  const handleEnhance = async () => {
      if (!fullPrompt) return;
      setIsEnhancing(true);
      try {
          const result = await enhancePromptWithAI(fullPrompt, activeTab);
          setEnhancedResult(result);
      } catch (e) {
          console.error(e);
          alert("Failed to enhance prompt.");
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
      <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Prompt Engineering Guide</h1>
            <p className="text-gray-300">Build professional prompts using industry-standard techniques.</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
              <button 
                onClick={() => setActiveTab('video')}
                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                  <Video className="mr-2 h-5 w-5" /> Video Prompts
              </button>
              <button 
                onClick={() => setActiveTab('image')}
                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'image' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                  <ImageIcon className="mr-2 h-5 w-5" /> Image Prompts
              </button>
          </div>

          {/* Prompt Builder Box */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 mb-8 sticky top-4 z-30 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <Wand2 className="h-4 w-4 mr-2" /> Prompt Builder
                  </h2>
                  <div className="flex gap-2">
                       <Button variant="ghost" onClick={() => { setBuilderSegments([]); setBaseSubject(''); setEnhancedResult(null); setAdvice(null); }} className="text-xs h-8">
                           <Trash2 className="h-3 w-3 mr-1" /> Clear
                       </Button>
                  </div>
              </div>

              <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Start with your main subject (e.g. 'A futuristic cyberpunk city', 'A cat eating pizza')..."
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none mb-3"
                    value={baseSubject}
                    onChange={(e) => setBaseSubject(e.target.value)}
                  />
                  
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-black/50 rounded-lg border border-gray-800">
                      {builderSegments.length === 0 && !baseSubject && <span className="text-gray-600 text-sm italic p-1">Select tags below to build your prompt...</span>}
                      {builderSegments.map((seg, idx) => (
                          <span key={idx} className="bg-red-900/40 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-xs flex items-center group">
                              {seg.label}
                              <button onClick={() => toggleSegment(seg)} className="ml-2 text-red-400 hover:text-white"><X className="h-3 w-3" /></button>
                          </span>
                      ))}
                  </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-t border-gray-800 pt-4">
                  <div className="text-xs text-gray-500 font-mono flex-grow break-all">
                      {fullPrompt || "Empty prompt..."}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                      <Button variant="secondary" onClick={handleAnalyze} isLoading={isAnalyzing} className="text-xs py-2 h-9">
                          <Check className="h-3 w-3 mr-2" /> Check Quality
                      </Button>
                      <Button variant="secondary" onClick={handleEnhance} isLoading={isEnhancing} className="text-xs py-2 h-9 bg-purple-900/30 border-purple-500/50 text-purple-200 hover:bg-purple-900/50">
                          <Sparkles className="h-3 w-3 mr-2" /> AI Enhance
                      </Button>
                      <Button onClick={handleCopy} className="text-xs py-2 h-9">
                          <Copy className="h-3 w-3 mr-2" /> Copy
                      </Button>
                  </div>
              </div>

              {/* AI Results Area */}
              {(advice || enhancedResult) && (
                  <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                      {advice && (
                          <div className={`p-3 rounded-lg border ${advice.score > 7 ? 'bg-green-900/20 border-green-500/30' : 'bg-yellow-900/20 border-yellow-500/30'}`}>
                              <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold uppercase">Coherence Score</span>
                                  <span className="font-bold">{advice.score}/10</span>
                              </div>
                              <p className="text-xs text-gray-300">{advice.advice}</p>
                          </div>
                      )}
                      {enhancedResult && (
                          <div className="p-3 rounded-lg bg-purple-900/10 border border-purple-500/30 relative group">
                              <span className="text-xs font-bold text-purple-400 uppercase mb-1 block">AI Enhanced Version</span>
                              <p className="text-xs text-gray-300 line-clamp-3 group-hover:line-clamp-none transition-all">{enhancedResult.enhancedPrompt}</p>
                              {enhancedResult.technicalParams && (
                                  <p className="text-[10px] text-gray-500 mt-1 font-mono">{enhancedResult.technicalParams}</p>
                              )}
                          </div>
                      )}
                  </div>
              )}
          </div>

          {/* Search */}
          <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                  type="text" 
                  placeholder="Search styles, camera angles, effects..." 
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          {/* Categories Grid */}
          <div className="space-y-8 pb-10">
              {filteredCategories.map(cat => {
                  const Icon = cat.icon;
                  return (
                      <div key={cat.id} className="animate-fade-in-up">
                          <div className={`flex items-center mb-4 ${cat.color}`}>
                              <Icon className="h-6 w-6 mr-3" />
                              <h3 className="text-xl font-bold text-white">{cat.title}</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {cat.items.map((item, idx) => {
                                  const isSelected = builderSegments.some(s => s.label === item.label);
                                  return (
                                      <button
                                          key={idx}
                                          onClick={() => toggleSegment(item)}
                                          className={`text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden group
                                              ${isSelected 
                                                  ? `bg-gray-800 border-red-500 ring-1 ring-red-500` 
                                                  : `bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800`
                                              }`}
                                      >
                                          <div className="relative z-10">
                                              <div className="font-bold text-sm text-gray-200 mb-1 flex justify-between">
                                                  {item.label}
                                                  {isSelected && <CheckCircle className="h-4 w-4 text-red-500" />}
                                              </div>
                                              <div className="text-[10px] text-gray-500 leading-tight group-hover:text-gray-400">
                                                  {item.prompt.length > 60 ? item.prompt.substring(0, 60) + '...' : item.prompt}
                                              </div>
                                          </div>
                                          {isSelected && <div className="absolute inset-0 bg-red-500/5 z-0"></div>}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  );
              })}

              {filteredCategories.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                      <p>No prompt items found matching "{searchTerm}".</p>
                  </div>
              )}
          </div>
      </div>
  );
};

export default PromptGuideView;
