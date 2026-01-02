import React, { useState } from 'react';
import { useClientData } from '@/hooks/useClientData';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarView: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { posts, isLoadingPosts } = useClientData(isAuthenticated);
    const [currentDate, setCurrentDate] = useState(new Date());

    if (isLoadingPosts) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
    };

    // Filter posts for current month
    const currentMonthPosts = posts.filter(post => {
        const postDate = post.scheduledAt && (post.scheduledAt as any).toDate
            ? (post.scheduledAt as any).toDate()
            : new Date(post.scheduledAt);
        return postDate.getMonth() === currentDate.getMonth() &&
            postDate.getFullYear() === currentDate.getFullYear();
    });

    const getPostsForDay = (day: number) => {
        return currentMonthPosts.filter(post => {
            const postDate = post.scheduledAt && (post.scheduledAt as any).toDate
                ? (post.scheduledAt as any).toDate()
                : new Date(post.scheduledAt);
            return postDate.getDate() === day;
        });
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CalendarIcon className="text-red-600" /> Content Calendar
                    </h1>
                    <p className="text-gray-400">Manage your scheduled content</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-900 p-2 rounded-xl border border-gray-800">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black rounded-lg text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-white min-w-[150px] text-center select-none">
                        {monthName} {year}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black rounded-lg text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-black border-b border-gray-800">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-gray-800 gap-[1px]">
                    {/* Empty cells for previous month */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-900/50 min-h-[120px]" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const dayPosts = getPostsForDay(day);
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <div key={day} className={`bg-gray-900 p-2 transition-colors hover:bg-gray-900/80 min-h-[120px] group relative ${isToday ? 'bg-gray-800/50' : ''}`}>
                                <div className={`font-mono text-sm mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-red-600 text-white font-bold' : 'text-gray-500'}`}>
                                    {day}
                                </div>
                                <div className="space-y-1">
                                    {dayPosts.map(post => (
                                        <div
                                            key={post.id}
                                            className={`text-[10px] px-2 py-1 rounded border truncate cursor-pointer transition-transform hover:scale-105 ${post.platform === 'Instagram' ? 'bg-pink-900/20 border-pink-500/30 text-pink-300' :
                                                    post.platform === 'LinkedIn' ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' :
                                                        post.platform === 'Twitter' ? 'bg-sky-900/20 border-sky-500/30 text-sky-300' :
                                                            'bg-gray-800 border-gray-700 text-gray-300'
                                                }`}
                                            title={post.content}
                                        >
                                            {post.platform.substring(0, 2)} • {post.content.substring(0, 15)}...
                                        </div>
                                    ))}
                                </div>
                                {dayPosts.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center">
                                            <span className="text-gray-500 text-lg leading-none">+</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Empty cells for next month (optional, to complete row) */}
                    {Array.from({ length: (35 - (days + firstDay)) % 7 < 0 ? 7 + (35 - (days + firstDay)) % 7 : (35 - (days + firstDay)) % 7 }).map((_, i) => (
                        <div key={`next-${i}`} className="bg-gray-900/50 min-h-[120px]" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
