import React, { useState } from 'react';
import { Copy, Briefcase, Camera, Image as ImageIcon, Check, Monitor, Building2, ShoppingBag, Share2, Film } from 'lucide-react';
import Button from '../components/Button';

interface Template {
  id: string;
  category: string;
  title: string;
  prompt: string;
}

const TEMPLATES: Template[] = [
  // --- Video Realism / AI Styles (NEW) ---
  {
    id: 'video-bullet-time',
    category: 'AI Video Realism',
    title: 'Bullet Time / Time Freeze',
    prompt: 'Bullet time effect, time frozen. The camera moves around a subject suspended in mid-air jumping over a puddle. Water droplets are frozen in space. 360-degree camera movement, high shutter speed, sharp details, Matrix style.'
  },
  {
    id: 'video-snorricam',
    category: 'AI Video Realism',
    title: 'Snorricam (Body Mount)',
    prompt: 'Snorricam shot (chest-mounted camera) focused on a panicked man running through a subway station. The subject remains perfectly still in the center of the frame while the background rushes by chaotically. Disorienting, intense, psychological thriller vibe.'
  },
  {
    id: 'video-light-leaks',
    category: 'AI Video Realism',
    title: 'Vintage Film Burn',
    prompt: 'Super 8mm film footage of a road trip. Warm sunset lighting, heavy film grain, erratic light leaks and film burns flashing across the screen. Nostalgic, dreamy, handheld camera sway, 18fps.'
  },
  {
    id: 'video-rack-focus',
    category: 'AI Video Realism',
    title: 'Cinematic Rack Focus',
    prompt: 'Cinematic close-up, rack focus shot. Starts focused on rain droplets on a coffee shop window in the foreground, then smoothly shifts focus to a woman laughing inside the warm cafe. 85mm lens, bokeh, golden hour lighting, 4k, high fidelity.'
  },
  {
    id: 'video-fpv-drone',
    category: 'AI Video Realism',
    title: 'FPV Drone Fly-Through',
    prompt: 'Fast-paced FPV drone shot flying through a narrow neon-lit cyberpunk alleyway, dodging pipes and steam vents. High motion blur, dynamic camera movement, volumetric lighting, hyper-realistic textures, 60fps.'
  },
  {
    id: 'video-fluid-sim',
    category: 'AI Video Realism',
    title: 'Macro Fluid Simulation',
    prompt: 'Macro shot of colorful ink dropping into clear water. Swirling physics simulation, detailed fluid dynamics, slow motion, high contrast, studio lighting, 8k resolution, mesmerizing patterns.'
  },
  {
    id: 'video-dirty-lens',
    category: 'AI Video Realism',
    title: 'Action Cam (Dirty Lens)',
    prompt: 'POV action camera footage of a mountain biker going downhill. Mud splashes onto the lens (dirty lens effect), camera shake, wide-angle fisheye lens, raw footage style, sunlight flaring through trees.'
  },
  {
    id: 'video-glitch-vhs',
    category: 'AI Video Realism',
    title: '90s VHS Horror',
    prompt: '1990s camcorder footage, handheld shake. Exploring an abandoned mall at night. VHS tracking lines, color bleeding, magnetic tape noise, low resolution, timestamp in corner, eerie atmosphere.'
  },
  {
    id: 'video-dolly-zoom',
    category: 'AI Video Realism',
    title: 'Vertigo Dolly Zoom',
    prompt: 'Dolly zoom (Zolly) effect on a subject standing on a rooftop. The subject remains the same size while the city background dramatically expands and recedes. Tense atmosphere, cinematic movement.'
  },
  {
    id: 'video-reflection',
    category: 'AI Video Realism',
    title: 'Puddle Reflection',
    prompt: 'Low angle shot focused on a puddle in a rainy street. The reflection of a neon sign is visible in the water. A car drives by, splashing the water and disturbing the reflection. Ray-traced reflections, photorealistic.'
  },

  // Professional / Corp
  {
    id: 'corp-headshot',
    category: 'Professional',
    title: 'Modern Corporate Headshot',
    prompt: 'Professional corporate headshot of a confident subject, studio lighting, neutral grey background, high-end commercial photography, sharp focus, 85mm lens, 4k.'
  },
  {
    id: 'office-lifestyle',
    category: 'Professional',
    title: 'Modern Office Lifestyle',
    prompt: 'Candid shot of diverse professionals collaborating in a modern, glass-walled office space with natural sunlight, depth of field, authentic interaction, business casual attire.'
  },
  {
    id: 'conf-room',
    category: 'Professional',
    title: 'Executive Conference Room',
    prompt: 'Empty modern conference room with large mahogany table, ergonomic chairs, city skyline view through window, golden hour lighting, cinematic business look.'
  },
  
  // Product / E-commerce
  {
    id: 'product-minimal',
    category: 'E-commerce',
    title: 'Minimalist Product Podium',
    prompt: 'Product photography on a sleek geometric podium, pastel background, soft diffused lighting, shadows for depth, high resolution, award-winning commercial style.'
  },
  {
    id: 'product-flatlay',
    category: 'E-commerce',
    title: 'Creative Flatlay',
    prompt: 'Top-down flatlay of lifestyle items arranged neatly on a marble surface, natural morning light, props including coffee cup and succulents, high detail, aesthetic composition.'
  },
  {
    id: 'packaging-mockup',
    category: 'E-commerce',
    title: 'Eco-Friendly Packaging',
    prompt: 'Close-up of sustainable cardboard packaging on a wooden texture, warm lighting, green leaf props nearby, conveying organic and eco-friendly brand values.'
  },
  
  // Social Media / Creative
  {
    id: 'ig-story-sale',
    category: 'Social Media',
    title: 'Instagram Story Sale',
    prompt: 'Vibrant background for Instagram Story, bold "FLASH SALE" text space in center, confetti and balloon elements, neon pink and yellow color palette, 3D render style, 9:16 aspect ratio.'
  },
  {
    id: 'linkedin-achievement',
    category: 'Social Media',
    title: 'LinkedIn Achievement',
    prompt: 'Professional workspace with a trophy or award on the desk, blurred background of a modern office, lighting highlighting success and accomplishment, blue and gold tones.'
  },
  {
    id: 'quote-background',
    category: 'Social Media',
    title: 'Inspirational Quote Background',
    prompt: 'Abstract watercolor background with soft gradients of blue and purple, texture of canvas, plenty of negative space in the center for text overlay, calming and artistic.'
  },
  
  // Tech
  {
    id: 'tech-workspace',
    category: 'Tech',
    title: 'Developer Workspace',
    prompt: 'Top-down view of a clean developer desk setup, mechanical keyboard, coffee cup, dual monitors with code, warm ambient lighting, cozy tech aesthetic.'
  },
  {
    id: 'server-room',
    category: 'Tech',
    title: 'Modern Server Room',
    prompt: 'Futuristic server room aisle with glowing blue LED lights, sleek black server racks, depth of field, high-tech cybersecurity atmosphere.'
  },
  
  // Retail / Business
  {
    id: 'retail-store',
    category: 'Business',
    title: 'Boutique Store Interior',
    prompt: 'Interior architectural photography of a high-end boutique retail store, well-lit shelving, organized merchandise, inviting atmosphere, symmetrical composition.'
  },
  {
    id: 'cafe-interior',
    category: 'Business',
    title: 'Cozy Cafe Interior',
    prompt: 'Warm and inviting cafe interior, rustic wooden tables, hanging Edison bulbs, steam rising from coffee cups, blurred customers in background, hygge atmosphere.'
  },
  {
    id: 'real-estate-exterior',
    category: 'Business',
    title: 'Modern Home Exterior',
    prompt: 'Exterior shot of a modern minimalist house at twilight, warm interior lights glowing, manicured lawn, architectural photography, wide angle.'
  }
];

const TemplatesView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filteredTemplates = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  const getIcon = (cat: string) => {
      switch(cat) {
          case 'Professional': return Briefcase;
          case 'E-commerce': return ShoppingBag;
          case 'Tech': return Monitor;
          case 'Business': return Building2;
          case 'Social Media': return Share2;
          case 'AI Video Realism': return Film;
          default: return ImageIcon;
      }
  };

  return (
    <div className="p-6 md:p-10 flex-grow max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Image & Video Templates</h1>
        <p className="text-gray-300">High-quality prompts for business-level content creation.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    filter === cat 
                    ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                    : 'bg-gray-900 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'
                }`}
              >
                  {cat}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((t) => {
          const Icon = getIcon(t.category);
          return (
            <div key={t.id} className="bg-gray-950 text-white rounded-xl p-6 shadow-lg border border-gray-800 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all flex flex-col transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-red-400 font-bold text-xs uppercase tracking-wider bg-red-900/20 px-2 py-1 rounded border border-red-500/20">
                    <Icon className="h-3 w-3 mr-2" />
                    {t.category}
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{t.title}</h3>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 text-sm text-gray-400 italic mb-6 flex-grow font-serif">
                "{t.prompt}"
                </div>

                <Button 
                onClick={() => handleCopy(t.prompt, t.id)} 
                variant={copiedId === t.id ? 'primary' : 'secondary'}
                className="w-full text-sm"
                >
                {copiedId === t.id ? (
                    <span className="flex items-center"><Check className="h-4 w-4 mr-2" /> Copied!</span>
                ) : (
                    <span className="flex items-center"><Copy className="h-4 w-4 mr-2" /> Copy Prompt</span>
                )}
                </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesView;
