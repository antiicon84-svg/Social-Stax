import React from 'react';
import { useClientData } from '@/hooks/useClientData';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const CalendarView: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { posts, isLoadingPosts } = useClientData(isAuthenticated);

    if (isLoadingPosts) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // Group posts by date
    const postsByDate = posts.reduce((acc, post) => {
        // Handle both Firestore Timestamp and Date objects
        let dateStr = '';
        if (post.scheduledAt) {
            // @ts-ignore - scheduledAt might be a timestamp from Firestone
            const date = post.scheduledAt.toDate ? post.scheduledAt.toDate() : new Date(post.scheduledAt);
            dateStr = date.toDateString();
        }

        if (dateStr) {
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(post);
        }
        return acc;
    }, {} as Record<string, typeof posts>);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Content Calendar
                    </h1>
                    <p className="text-gray-400 mt-2">
                        View your scheduled content across all platforms
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for a real calendar component - listing by date for now */}
                {Object.entries(postsByDate).length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-gray-900/50 rounded-xl border border-gray-800">
                        <p className="text-gray-400">No scheduled posts found.</p>
                    </div>
                ) : (
                    Object.entries(postsByDate).map(([date, dayPosts]) => (
                        <div key={date} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                            <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">{date}</h3>
                            <div className="space-y-3">
                                {dayPosts.map(post => (
                                    <div key={post.id} className="bg-black/40 p-3 rounded border border-gray-700">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${post.platform === 'Instagram' ? 'bg-pink-900/50 text-pink-300' :
                                                    post.platform === 'LinkedIn' ? 'bg-blue-900/50 text-blue-300' :
                                                        post.platform === 'Twitter' ? 'bg-sky-900/50 text-sky-300' :
                                                            'bg-gray-800 text-gray-300'
                                                }`}>
                                                {post.platform}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {/* @ts-ignore */}
                                                {post.scheduledAt?.toDate ? post.scheduledAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CalendarView;
