import React from 'react';

const TemplatesView: React.FC = () => {
  const templates = [
    { id: 1, title: 'Product Launch', category: 'Instagram' },
    { id: 2, title: 'Hiring Notice', category: 'LinkedIn' },
    { id: 3, title: 'Flash Sale', category: 'Facebook' },
    { id: 4, title: 'Daily Tip', category: 'Twitter' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold mb-8">Content Templates</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-red-600 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-gray-800 rounded-lg mb-4 flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <span className="text-xl">📄</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{t.title}</h3>
            <p className="text-sm text-gray-500">{t.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesView;
