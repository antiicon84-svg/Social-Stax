import React, { useState } from 'react';
import { Copy, Check, Instagram, Linkedin, Twitter, Facebook, Video } from 'lucide-react';

const TemplatesView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const templates = [
    { 
      id: 1, 
      title: 'Product Launch Teaser', 
      category: 'Instagram', 
      icon: Instagram,
      prompt: "Create an exciting Instagram caption for a new product launch. Start with a hook about solving [Problem], then introduce [Product Name] as the ultimate solution. Use emojis, keep it under 3 lines, and end with a 'Link in Bio' call to action."
    },
    { 
      id: 2, 
      title: 'Thought Leadership', 
      category: 'LinkedIn', 
      icon: Linkedin,
      prompt: "Write a professional LinkedIn post about the future of [Industry]. Discuss 3 key trends: [Trend 1], [Trend 2], and [Trend 3]. End with a question to encourage engagement from connections."
    },
    { 
      id: 3, 
      title: 'Flash Sale Alert', 
      category: 'Facebook', 
      icon: Facebook,
      prompt: "Draft a Facebook post for a 24-hour flash sale. Highlight a 50% discount on [Product Category]. Create a sense of urgency using phrases like 'Time is running out' and 'Limited stock'. Include a direct link to the shop."
    },
    { 
      id: 4, 
      title: 'Industry News/Tips', 
      category: 'Twitter', 
      icon: Twitter,
      prompt: "Write a thread of 5 tweets summarizing the latest news in [Topic]. Make each tweet punchy and informative. Use relevant hashtags like #[Topic] and #[Industry]."
    },
    { 
      id: 5, 
      title: 'Behind the Scenes', 
      category: 'Instagram', 
      icon: Instagram,
      prompt: "Write a caption for an Instagram Reel showing behind-the-scenes at [Company]. Focus on the team culture, hard work, and fun atmosphere. use a casual and friendly tone."
    },
    { 
      id: 6, 
      title: 'Viral TikTok Script', 
      category: 'TikTok', 
      icon: Video,
      prompt: "Write a script for a 30-second TikTok video about [Topic]. Start with a visual hook (e.g., 'Stop doing this!'), followed by 3 quick tips, and end with a call to follow for more part 2."
    },
    { 
      id: 7, 
      title: 'Motivational Quote', 
      category: 'Instagram', 
      icon: Instagram,
      prompt: "Generate a motivational quote post for entrepreneurs. The theme is [Theme e.g., Resilience]. Include a short caption expanding on the quote and asking followers to tag a friend who needs to hear this."
    },
    { 
      id: 8, 
      title: 'Client Success Story', 
      category: 'LinkedIn', 
      icon: Linkedin,
      prompt: "Share a case study about how we helped [Client Name] achieve [Result]. specific metrics (e.g., 20% growth). Keep the tone professional and celebratory."
    }
  ];

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full text-white pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Templates</h1>
        <p className="text-gray-400">Jumpstart your content creation with these expert-crafted prompts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-red-600/50 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-red-600/20 group-hover:text-red-500 transition-colors">
                <t.icon size={20} />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.category}</span>
            </div>
            
            <h3 className="font-bold text-lg mb-2">{t.title}</h3>
            <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow">{t.prompt}</p>
            
            <button 
              onClick={() => handleCopy(t.id, t.prompt)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              {copiedId === t.id ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span className="text-green-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesView;
