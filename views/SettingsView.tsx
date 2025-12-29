import React, { useState } from 'react';
import AdminPanel from '@/components/AdminPanel';
import Button from '@/components/Button';
import { dev_setCurrentUserAsAdmin } from '~/services/dbService';

const SettingsView: React.FC = () => {
  const [isPromoting, setIsPromoting] = useState(false);

  const handleMakeAdmin = async () => {
    setIsPromoting(true);
    try {
      await dev_setCurrentUserAsAdmin();
      alert('Success! You are now an Admin. Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to set admin role.');
    } finally {
      setIsPromoting(false);
    }
  };

 return (
 <div className="p-6 md:p-10 max-w-7xl mx-auto w-full pb-20">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
 <p className="text-gray-400">Manage your application settings and admin controls</p>
 </div>

 <div className="grid grid-cols-1 gap-8">
 {/* Developer Options */}
 <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 border-dashed">
    <h2 className="text-xl font-semibold mb-4 text-yellow-500">⚡ Developer Actions</h2>
    <p className="text-gray-400 mb-4 text-sm">Use these tools for testing and setup.</p>
    <Button onClick={handleMakeAdmin} isLoading={isPromoting} className="bg-yellow-600 hover:bg-yellow-700 text-white">
      Set My Role to Admin
    </Button>
 </div>

 {/* Admin Panel Section */}
 <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
 <h2 className="text-xl font-semibold mb-4 text-red-500">Admin Controls</h2>
 <AdminPanel />
 </div>

 {/* General Settings */}
 <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
 <h2 className="text-xl font-semibold mb-4 text-red-500">General Settings</h2>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-2">Application Theme</label>
 <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500">
 <option>Dark (Default)</option>
 <option>Light</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-2">Notification Preferences</label>
 <div className="space-y-2">
 <label className="flex items-center">
 <input type="checkbox" defaultChecked className="rounded" />
 <span className="ml-2 text-gray-300">Email Notifications</span>
 </label>
 <label className="flex items-center">
 <input type="checkbox" defaultChecked className="rounded" />
 <span className="ml-2 text-gray-300">Push Notifications</span>
 </label>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default SettingsView;
