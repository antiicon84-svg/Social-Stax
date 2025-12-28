import React from 'react';
import { Client, Post } from '~/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import UsageDisplay from '@/components/UsageDisplay';

interface DashboardViewProps {
 clients: Client[];
 posts: Post[];
 onDeletePost: (postId: string) => void;
 isLoadingClients: boolean;
 isLoadingPosts: boolean;
 onDataRefresh: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
 clients,
 posts,
 onDeletePost,
 isLoadingClients,
 isLoadingPosts,
 onDataRefresh
}) => {
 console.log('[DashboardView] Render', { clients, posts, isLoadingClients, isLoadingPosts });

 return (
 <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
 <div className="flex justify-between items-center mb-8">
 <h1 className="text-3xl font-bold text-white">Dashboard</h1>
 <Button onClick={onDataRefresh} variant="secondary">Refresh Data</Button>
 </div>

 {/* Usage Display Section */}
 <div className="mb-8">
 <UsageDisplay uid={''} email={''} plan={''} /><T>(
   userProfile: UserProfile,
   usageType: UsageType,
   aiFunction: (...args: any[]) => Promise<T>,
   amount: number = 1
 ) => {
   return async (...args: any[]): Promise<T> => {
     if (!userProfile.uid) {
       throw new Error('User profile must have a UID to track usage.');
     }
 
     // Check if the user has enough quota
     const hasQuota = await canPerformAction(userProfile, usageType, amount);
     if (!hasQuota) {
       const currentUsage = (await getUserUsage(userProfile.uid))?.[usageType] || 0;
       throw new Error(
         `Insufficient quota for ${usageType}. Current usage: .`
       );
     }
 
     // Execute the AI function
     const result = await aiFunction(...args);
 
     // Increment usage upon successful completion
     await incrementUsage(userProfile.uid, usageType, amount);
 
     return result;
   };
 };
 
 ```
 ```typescript
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
  <h2 className="text-xl font-semibold mb-4 text-red-500">Subscription Status</h2>
  <p className="text-gray-300">Plan: Pro</p>
  <p className="text-gray-300">Renews: 2024-12-01</p>
  <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm">Manage Subscription</button>
  </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
 <h2 className="text-xl font-semibold mb-4 text-red-500">Active Clients</h2>
 {isLoadingClients ? (
 <LoadingSpinner />
 ) : clients.length === 0 ? (
 <p className="text-gray-500 italic">No clients added yet.</p>
 ) : (
 <div className="space-y-3">
 {clients.map(client => (
 <div key={client.id} className="p-3 bg-gray-800 rounded border border-gray-700">
 <p className="font-medium text-white">{client.name}</p>
 <p className="text-xs text-gray-400">{client.industry}</p>
 </div>
 ))}
 </div>
 )}
 </section>

 <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
 <h2 className="text-xl font-semibold mb-4 text-red-500">Scheduled Posts</h2>
 {isLoadingPosts ? (
 <LoadingSpinner />
 ) : posts.length === 0 ? (
 <p className="text-gray-500 italic">No posts scheduled.</p>
 ) : (
 <div className="space-y-3">
 {posts.map(post => (
 <div key={post.id} className="p-3 bg-gray-800 rounded border border-gray-700 flex justify-between items-center">
 <div>
 <p className="text-sm text-white line-clamp-1">{post.content}</p>
 <p className="text-xs text-gray-400">{post.platform} • {new Date(post.scheduledDate).toLocaleDateString()}</p>
 </div>
 <Button 
 variant="danger" 
 className="p-1 text-xs" 
 onClick={() => onDeletePost(post.id)}
 >
 Delete
 </Button>
 </div>
 ))}
 </div>
 )}
 </section>
 </div>
 </div>
 );
};

export default DashboardView;