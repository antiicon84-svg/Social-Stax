import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveClient } from '~/services/dbService';
import { analyzeWebsite } from '~/services/aiService';
import { INDUSTRY_OPTIONS, BRAND_TONE_OPTIONS } from '@/config/constants';
import Button from '@/components/Button';
import { 
  Globe, 
  Upload, 
  User, 
  Briefcase, 
  Palette, 
  ArrowLeft,
  Search,
  Hash,
  Instagram,
  Phone,
  MessageCircle,
  StickyNote
} from 'lucide-react';
import { ClientType, Client } from '~/types';

interface CreateClientViewProps {
  onClientAdded: () => void;
}

const CreateClientView: React.FC<CreateClientViewProps> = ({ onClientAdded }) => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // Basic Info
  const [clientType, setClientType] = useState<ClientType>('Brand');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0].value);
  const [brandTone, setBrandTone] = useState(BRAND_TONE_OPTIONS[0].value);
  const [brandColor, setBrandColor] = useState('#ef4444');
  
  // Detailed Brand Kit
  const [description, setDescription] = useState('');
  const [mission, setMission] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tags, setTags] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [aiNotes, setAiNotes] = useState('');

  const handleAnalyze = async () => {
    if (!websiteUrl) return alert('Please enter a website URL');
    setIsAnalyzing(true);
    try {
      const data = await analyzeWebsite(websiteUrl);
      if (data) {
        if (data.name) setName(data.name);
        if (data.industry) setIndustry(data.industry);
        if (data.tone) setBrandTone(data.tone);
        if (data.description) setDescription(data.description);
        if (data.color) setBrandColor(data.color);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to analyze website. Please fill manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert('Please enter a client name');

    const newClient: Client = {
      id: Date.now().toString(),
      ownerEmail: 'user@example.com',
      name,
      clientType,
      industry,
      brandTone,
      primaryBrandColor: brandColor,
      description,
      mission,
      website: websiteUrl,
      phoneNumber: phone,
      whatsapp,
      socialLinks: { instagram },
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      contactInfo,
      additionalNotes: aiNotes,
      createdAt: new Date()
    };

    await saveClient(newClient);
    onClientAdded();
    navigate('/');
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-900 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <h1 className="text-3xl font-bold text-white">Add New Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Website Analysis Section */}
        <section className="bg-gray-950 border border-red-500/20 rounded-2xl p-6 shadow-xl shadow-red-900/5">
          <div className="flex items-center gap-2 mb-4 text-red-500">
            <Globe size={18} />
            <h2 className="font-bold text-sm uppercase tracking-wider">Auto-Fill from Website</h2>
          </div>
          <div className="flex gap-3">
            <input 
              type="url" 
              placeholder="https://example.com"
              className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
            <Button 
              type="button" 
              onClick={handleAnalyze} 
              isLoading={isAnalyzing}
              variant="secondary"
            >
              Analyze
            </Button>
          </div>
        </section>

        {/* Basic Information */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Client Type</label>
              <div className="flex bg-black p-1 rounded-xl border border-gray-800">
                <button 
                  type="button"
                  onClick={() => setClientType('Brand')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${clientType === 'Brand' ? 'bg-red-600/10 text-red-500 border border-red-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Briefcase size={16} /> Brand
                </button>
                <button 
                  type="button"
                  onClick={() => setClientType('Influencer')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${clientType === 'Influencer' ? 'bg-red-600/10 text-red-500 border border-red-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <User size={16} /> Influencer
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Logo</label>
              <div className="h-[52px] border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center text-gray-600 hover:border-red-500/50 hover:text-gray-400 cursor-pointer transition-all group">
                <div className="flex items-center gap-2">
                  <Upload size={16} className="group-hover:text-red-500" />
                  <span className="text-sm font-medium">Upload</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</label>
              <input 
                type="text" 
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Industry</label>
              <input 
                type="text" 
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brand Tone</label>
              <select 
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-600 outline-none appearance-none"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
              >
                {BRAND_TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brand Color</label>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl border border-gray-800 shrink-0" style={{ backgroundColor: brandColor }} />
                <input 
                  type="text" 
                  className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-white font-mono"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Brand Kit */}
        <section className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4 text-red-500">
            <Palette size={18} />
            <h2 className="text-lg font-bold text-white">Detailed Brand Kit</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description (Bio)</label>
              <textarea 
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white min-h-[100px] outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Short bio or summary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mission Statement</label>
              <textarea 
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white min-h-[100px] outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Our mission is to..."
                value={mission}
                onChange={(e) => setMission(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} /> Website
                </label>
                <input 
                  type="url" 
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-600"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> Phone Number
                </label>
                <input 
                  type="tel" 
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-600"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageCircle size={12} /> WhatsApp
                </label>
                <input 
                  type="tel" 
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-600"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Instagram size={12} /> Instagram Handle
                </label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-600"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={12} /> Tags (Keywords)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Sustainable, Luxury, Gen Z"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-600"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Search size={12} /> General Contact Info
                </label>
                <input 
                  type="text" 
                  placeholder="Email or City"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-red-600"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <StickyNote size={12} /> Additional AI Notes
              </label>
              <textarea 
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white min-h-[100px] outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Enter any specific rules or instructions for the AI..."
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full">Create Client Profile</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientView;