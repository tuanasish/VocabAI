import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <Layout>
                <main className="flex flex-1 items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </main>
            </Layout>
        );
    }

    const levelProgress = ((profile?.xp || 0) % 100);
    const nextLevelXP = (profile?.level || 1) * 100;

    return (
        <Layout>
            <main className="px-4 sm:px-6 lg:px-8 xl:px-20 flex flex-1 justify-center py-8">
                <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1 gap-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">My Profile</h1>
                            <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Level & XP Section */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg">
                                {profile?.level || 1}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                    Level {profile?.level || 1}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {profile?.xp || 0} / {nextLevelXP} XP
                                </p>
                                <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                        style={{ width: `${levelProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{profile?.xp || 0}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total XP</p>
                            </div>
                            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{profile?.streak_days || 0}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Day Streak</p>
                            </div>
                            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{profile?.daily_goal || 20}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Daily Goal</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Achievements */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                                Achievements
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="material-symbols-outlined text-2xl text-green-500">check_circle</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">First Steps</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Complete your first lesson</p>
                                    </div>
                                </div>
                                {(profile?.streak_days || 0) >= 3 && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <span className="material-symbols-outlined text-2xl text-orange-500">local_fire_department</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">3 Day Streak</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Study for 3 days in a row</p>
                                        </div>
                                    </div>
                                )}
                                {(profile?.streak_days || 0) >= 7 && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <span className="material-symbols-outlined text-2xl text-red-500">whatshot</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">Week Warrior</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Study for 7 days in a row</p>
                                        </div>
                                    </div>
                                )}
                                {(profile?.xp || 0) >= 500 && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <span className="material-symbols-outlined text-2xl text-purple-500">stars</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">XP Master</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Earn 500 XP</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">analytics</span>
                                Activity Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400">Last Study Date</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {profile?.last_study_date || 'Never'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400">Current Streak</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                        {profile?.streak_days || 0} days
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Total XP Earned</span>
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                        {profile?.xp || 0} XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export default ProfilePage;
