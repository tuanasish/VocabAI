import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    xp: number;
    level: number;
    streak_days: number;
}

const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, xp, level, streak_days')
                .order('xp', { ascending: false })
                .limit(50);

            if (error) throw error;

            setLeaderboard(data || []);

            if (user) {
                const rank = data?.findIndex(p => p.id === user.id);
                if (rank !== undefined && rank !== -1) {
                    setUserRank(rank + 1);
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (email: string | undefined, avatarUrl: string | null) => {
        if (avatarUrl) return avatarUrl;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'user'}`;
    };

    const currentUserProfile = leaderboard.find(p => p.id === user?.id);

    return (
        <Layout>
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="flex flex-wrap justify-between gap-3 pb-6">
                    <p className="text-slate-900 dark:text-white text-4xl font-black tracking-[-0.033em] min-w-72">Community Hub</p>
                </div>

                {/* Tabs */}
                <div className="pb-6">
                    <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8">
                        <button className="flex flex-col items-center justify-center border-b-[3px] border-primary pb-3 pt-4">
                            <p className="text-primary text-sm font-bold tracking-[0.015em]">Leaderboard</p>
                        </button>
                        <button className="flex flex-col items-center justify-center border-b-[3px] border-transparent pb-3 pt-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-[0.015em] hover:text-slate-700 dark:hover:text-slate-200">Community Feed</p>
                        </button>
                        <button className="flex flex-col items-center justify-center border-b-[3px] border-transparent pb-3 pt-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-[0.015em] hover:text-slate-700 dark:hover:text-slate-200">My Profile</p>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area - Leaderboard */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Leaderboard</h2>
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    <button className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium rounded shadow-sm">Weekly</button>
                                    <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Monthly</button>
                                    <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">All-Time</button>
                                </div>
                            </div>

                            {/* Leaderboard List */}
                            <ul className="space-y-2">
                                {loading ? (
                                    <div className="text-center py-8 text-slate-500">Loading leaderboard...</div>
                                ) : (
                                    leaderboard.map((profile, index) => {
                                        const rank = index + 1;
                                        let rankStyle = "text-slate-500 dark:text-slate-400 font-semibold text-md";
                                        let icon = null;

                                        if (rank === 1) {
                                            rankStyle = "text-yellow-500 font-bold text-xl";
                                            icon = <span className="material-symbols-outlined ml-2 text-yellow-500">emoji_events</span>;
                                        } else if (rank === 2) {
                                            rankStyle = "text-slate-400 font-bold text-xl";
                                            icon = <span className="material-symbols-outlined ml-2 text-slate-400">emoji_events</span>;
                                        } else if (rank === 3) {
                                            rankStyle = "text-orange-400 font-bold text-xl";
                                            icon = <span className="material-symbols-outlined ml-2 text-orange-400">emoji_events</span>;
                                        }

                                        const isCurrentUser = profile.id === user?.id;

                                        return (
                                            <li key={profile.id} className={`flex items-center p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                                <span className={`w-8 text-center ${rankStyle}`}>{rank}</span>
                                                <div
                                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ml-2 border border-slate-200 dark:border-slate-700"
                                                    style={{ backgroundImage: `url("${getAvatarUrl(undefined, profile.avatar_url)}")` }}
                                                ></div>
                                                <p className="flex-1 ml-4 font-semibold text-slate-900 dark:text-white">
                                                    {profile.full_name || 'Anonymous User'}
                                                    {isCurrentUser && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">You</span>}
                                                </p>
                                                <div className="text-right">
                                                    <span className="block font-bold text-primary">{profile.xp?.toLocaleString() || 0} XP</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Lvl {profile.level || 1}</span>
                                                </div>
                                                {icon}
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 mb-4 border-4 border-slate-100 dark:border-slate-800"
                                    style={{ backgroundImage: `url("${getAvatarUrl(user?.email, null)}")` }}
                                ></div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentUserProfile?.full_name || user?.email?.split('@')[0] || 'User'}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Level {currentUserProfile?.level || 1} • Word Wizard</p>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                                    <span>Progress to Level {(currentUserProfile?.level || 1) + 1}</span>
                                    <span>{currentUserProfile?.xp || 0} / {((currentUserProfile?.level || 1) + 1) * 1000} XP</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((currentUserProfile?.xp || 0) % 1000) / 10, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <button className="w-full mt-6 flex items-center justify-center gap-2 h-10 px-4 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                <span className="material-symbols-outlined text-lg">share</span>
                                Share Progress
                            </button>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Achievements</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                                    <span className="material-symbols-outlined text-3xl text-green-500">school</span>
                                    <p className="text-[10px] font-bold mt-1 text-green-700 dark:text-green-400">100 Words</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                                    <span className="material-symbols-outlined text-3xl text-orange-500">local_fire_department</span>
                                    <p className="text-[10px] font-bold mt-1 text-orange-700 dark:text-orange-400">7 Day Streak</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
                                    <span className="material-symbols-outlined text-3xl text-purple-500">psychology</span>
                                    <p className="text-[10px] font-bold mt-1 text-purple-700 dark:text-purple-400">Quick Thinker</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900/30">
                                    <span className="material-symbols-outlined text-3xl text-sky-500">rocket_launch</span>
                                    <p className="text-[10px] font-bold mt-1 text-sky-700 dark:text-sky-400">Fast Learner</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50">
                                    <span className="material-symbols-outlined text-3xl text-slate-400">lock</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50">
                                    <span className="material-symbols-outlined text-3xl text-slate-400">lock</span>
                                </div>
                            </div>
                            <button className="block w-full text-center mt-4 text-sm font-bold text-primary hover:underline">View All</button>
                        </div>

                        {/* Suggested Friends */}
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Suggested Friends</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-200" style={{ backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Emma")' }}></div>
                                    <div className="ml-3 flex-1">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">Emma White</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Word Enthusiast</p>
                                    </div>
                                    <button className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                    </button>
                                </li>
                                <li className="flex items-center">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-200" style={{ backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Ben")' }}></div>
                                    <div className="ml-3 flex-1">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">Ben Carter</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Grammar Guru</p>
                                    </div>
                                    <button className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommunityPage;
