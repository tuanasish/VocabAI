import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSound } from '../hooks/useSound';

type SettingsTab = 'account' | 'notifications' | 'audio' | 'privacy';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Account State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Notifications State
    const [dailyGoal, setDailyGoal] = useState(20);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Audio State (Local Storage)
    const [ttsSpeed, setTtsSpeed] = useState(1);
    const [autoPlayAudio, setAutoPlayAudio] = useState(false);

    // Sound Effects
    const sound = useSound();
    const [soundEnabled, setSoundEnabled] = useState(sound.getSettings().enabled);
    const [soundVolume, setSoundVolume] = useState(sound.getSettings().volume * 100);

    // Privacy State
    const [isProfilePublic, setIsProfilePublic] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            loadLocalSettings();
        }
    }, [user]);

    const loadLocalSettings = () => {
        const savedSpeed = localStorage.getItem('vocabai_tts_speed');
        if (savedSpeed) setTtsSpeed(parseFloat(savedSpeed));

        const savedAutoPlay = localStorage.getItem('vocabai_autoplay');
        if (savedAutoPlay) setAutoPlayAudio(savedAutoPlay === 'true');

        const savedPublic = localStorage.getItem('vocabai_public_profile');
        if (savedPublic) setIsProfilePublic(savedPublic === 'true');
    };

    const fetchUserProfile = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, daily_goal, notifications_enabled')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setFullName(data?.full_name || '');
            setEmail(user.email || '');
            setDailyGoal(data?.daily_goal || 20);
            setNotificationsEnabled(data?.notifications_enabled ?? true);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // 1. Update Supabase Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    daily_goal: dailyGoal,
                    notifications_enabled: notificationsEnabled
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Update Email if changed
            if (email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: email
                });
                if (emailError) throw emailError;
                toast.success('Email updated! Please check your inbox to confirm.');
            }

            // 3. Save Local Settings
            localStorage.setItem('vocabai_tts_speed', ttsSpeed.toString());
            localStorage.setItem('vocabai_autoplay', autoPlayAudio.toString());
            localStorage.setItem('vocabai_public_profile', isProfilePublic.toString());

            toast.success('Settings saved successfully!');
        } catch (error: any) {
            console.error('Error updating settings:', error);
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            toast.error('Please enter a new password');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

            if (profileError) throw profileError;

            await supabase.auth.signOut();
            toast.success('Account deleted successfully');
            navigate('/');
        } catch (error: any) {
            console.error('Error deleting account:', error);
            toast.error(error.message || 'Failed to delete account');
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleExportData = () => {
        const data = {
            user: { fullName, email },
            settings: { dailyGoal, notificationsEnabled, ttsSpeed, autoPlayAudio, isProfilePublic },
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocabai_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
    };

    const renderSidebarItem = (tab: SettingsTab, icon: string, label: string) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${activeTab === tab
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            <span className="material-symbols-outlined text-xl" style={activeTab === tab ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {icon}
            </span>
            <span className="text-sm">{label}</span>
        </button>
    );

    return (
        <Layout>
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* SideNavBar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="flex h-full min-h-[auto] flex-col justify-between bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-300 dark:bg-slate-700" style={{ backgroundImage: `url("https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}")` }}></div>
                                    <div className="flex flex-col overflow-hidden">
                                        <h1 className="text-base font-medium text-slate-900 dark:text-white truncate">{fullName || 'User'}</h1>
                                        <p className="text-sm font-normal text-slate-500 dark:text-slate-400 truncate">{email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {renderSidebarItem('account', 'person', 'Account')}
                                    {renderSidebarItem('notifications', 'notifications', 'Notifications')}
                                    {renderSidebarItem('audio', 'volume_up', 'Audio')}
                                    {renderSidebarItem('privacy', 'lock', 'Privacy & Data')}
                                </div>
                            </div>
                            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4">
                                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 w-full text-left">
                                    <span className="material-symbols-outlined text-xl">logout</span>
                                    <span className="text-sm font-medium">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Settings Content */}
                    <main className="flex-1">
                        <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[600px]">
                            {/* PageHeading */}
                            <div className="pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                                <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">
                                    {activeTab === 'account' && 'Account Settings'}
                                    {activeTab === 'notifications' && 'Notifications'}
                                    {activeTab === 'audio' && 'Audio Preferences'}
                                    {activeTab === 'privacy' && 'Privacy & Data'}
                                </h2>
                            </div>

                            {/* ACCOUNT TAB */}
                            {activeTab === 'account' && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <label className="flex flex-col gap-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</span>
                                                <input
                                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                />
                                            </label>
                                            <label className="flex flex-col gap-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</span>
                                                <input
                                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
                                        <div className="max-w-md space-y-4">
                                            <label className="flex flex-col gap-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</span>
                                                <input
                                                    type="password"
                                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                    placeholder="Enter current password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                            </label>
                                            <label className="flex flex-col gap-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</span>
                                                <input
                                                    type="password"
                                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-background-light dark:bg-background-dark px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </label>
                                            <button
                                                onClick={handleUpdatePassword}
                                                disabled={loading}
                                                className="px-6 py-2.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                                            >
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-red-600 dark:text-red-500">Danger Zone</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Once you delete your account, there is no going back. Please be certain.</p>
                                        <button
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* NOTIFICATIONS TAB */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Study Goal</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Set your daily XP target to stay motivated.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="1000"
                                                    step="10"
                                                    value={dailyGoal}
                                                    onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                                                    className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none text-center font-bold"
                                                />
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">XP / day</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Notifications</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Receive daily reminders and weekly progress reports.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationsEnabled}
                                                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AUDIO TAB */}
                            {activeTab === 'audio' && (
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Text-to-Speech Speed</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-slate-500">Slow</span>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="1.5"
                                                    step="0.1"
                                                    value={ttsSpeed}
                                                    onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                                                />
                                                <span className="text-sm font-medium text-slate-500">Fast</span>
                                            </div>
                                            <p className="text-center mt-2 font-bold text-primary">{ttsSpeed}x</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-play Audio</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Automatically play pronunciation when viewing a new flashcard.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={autoPlayAudio}
                                                    onChange={(e) => setAutoPlayAudio(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sound Effects</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Play sound effects for quiz answers, achievements, and interactions.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={soundEnabled}
                                                    onChange={(e) => {
                                                        const enabled = e.target.checked;
                                                        setSoundEnabled(enabled);
                                                        sound.updateSettings({ enabled });
                                                        if (enabled) sound.play.click();
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        {soundEnabled && (
                                            <div className="pt-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sound Volume</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-slate-500">volume_down</span>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="5"
                                                        value={soundVolume}
                                                        onChange={(e) => {
                                                            const volume = parseInt(e.target.value);
                                                            setSoundVolume(volume);
                                                            sound.updateSettings({ volume: volume / 100 });
                                                        }}
                                                        onMouseUp={() => sound.play.click()}
                                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                                                    />
                                                    <span className="material-symbols-outlined text-slate-500">volume_up</span>
                                                </div>
                                                <p className="text-center mt-2 font-bold text-primary">{soundVolume}%</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PRIVACY TAB */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Public Profile</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Allow others to view your profile and achievements.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isProfilePublic}
                                                    onChange={(e) => setIsProfilePublic(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Export Data</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Download a copy of your personal data and learning progress.</p>
                                            <button
                                                onClick={handleExportData}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                                Download JSON
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Global Save Button */}
                            <div className="flex justify-end pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete Account"
                message="Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </Layout>
    );
};

export default SettingsPage;
