import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveClient } from '../services/dbService';
import { INDUSTRY_OPTIONS, BRAND_TONE_OPTIONS } from '../constants';
import Button from '../components/Button';

interface CreateClientViewProps {
  onClientAdded: () => void;
}

const CreateClientView: React.FC<CreateClientViewProps> = ({ onClientAdded }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0].value);
  const [tone, setTone] = useState(BRAND_TONE_OPTIONS[0].value);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert('Please enter a client name');

    await saveClient({
      id: '',
      name,
      industry,
      tone,
      guidelines: ''
    });

    onClientAdded();
    navigate('/');
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-white mb-8">Add New Client</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Client Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 outline-none transition-colors"
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Industry</label>
          <select 
            value={industry} 
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 outline-none transition-colors"
          >
            {INDUSTRY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Brand Tone</label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 outline-none transition-colors"
          >
            {BRAND_TONE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex gap-4">
          <Button type="submit" className="flex-1">Create Client</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientView;
