import React from 'react';

const PromptGuideView: React.FC = () => {
  const tips = [
    { title: 'Be Specific', description: 'Include details about the tone, audience, and platform.' },
    { title: 'Define the Goal', description: 'State whether you want to drive sales, increase engagement, or educate.' },
    { title: 'Use Constraints', description: 'Specify word counts, emoji usage, or specific hashtags to include.' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold mb-2 text-red-600">Prompt Engineering Guide</h1>
      <p className="text-gray-400 mb-8">Master the art of AI prompting to get the best content for your brand.</p>

      <div className="grid gap-6">
        {tips.map((tip, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-2 text-red-500">{tip.title}</h2>
            <p className="text-gray-300 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-red-900/10 border border-red-900/30 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Example Prompt</h2>
        <div className="bg-black/40 p-4 rounded-lg font-mono text-sm text-gray-300 border border-white/5">
          "Create a LinkedIn post for a high-end coffee brand targeting busy professionals. 
          Tone should be sophisticated and energetic. Focus on the organic origins and the 
          perfect morning routine. Include 3 relevant hashtags."
        </div>
      </div>
    </div>
  );
};

export default PromptGuideView;
