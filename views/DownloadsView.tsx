import React from 'react';

const DownloadsView: React.FC = () => {
  const downloads = [
    { id: '1', name: 'Brand Strategy Report', date: '2025-12-20', size: '2.4 MB', type: 'PDF' },
    { id: '2', name: 'Q4 Content Calendar', date: '2025-12-22', size: '1.1 MB', type: 'XLSX' },
    { id: '3', name: 'Social Media Asset Pack', date: '2025-12-23', size: '15.8 MB', type: 'ZIP' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold mb-2 text-red-600">Downloads</h1>
      <p className="text-gray-400 mb-8">Access your generated reports and exported content assets.</p>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="p-4 font-medium text-gray-400">Name</th>
              <th className="p-4 font-medium text-gray-400">Date</th>
              <th className="p-4 font-medium text-gray-400">Size</th>
              <th className="p-4 font-medium text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {downloads.map((item) => (
              <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-gray-400 text-sm">{item.date}</td>
                <td className="p-4 text-gray-400 text-sm">{item.size}</td>
                <td className="p-4 text-right">
                  <button className="text-red-500 hover:text-red-400 font-medium text-sm">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DownloadsView;
