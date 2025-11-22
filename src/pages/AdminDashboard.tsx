import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import EditSetModal from '../components/EditSetModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { VocabularySet } from '../types';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [sets, setSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSets: 0,
        publicSets: 0
    });

    // Modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [setToEdit, setSetToEdit] = useState<any | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [setToDelete, setSetToDelete] = useState<any | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch sets
            const { data: setsData, error: setsError } = await supabase
                .from('vocabulary_sets')
                .select('*')
                .order('created_at', { ascending: false });

            if (setsError) throw setsError;

            // Fetch profiles for the sets
            const userIds = Array.from(new Set(setsData?.map(s => s.created_by).filter(Boolean))) as string[];

            let profilesMap: Record<string, any> = {};
            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', userIds);

                if (!profilesError && profilesData) {
                    profilesMap = profilesData.reduce((acc, profile) => {
                        acc[profile.id] = profile;
                        return acc;
                    }, {} as Record<string, any>);
                }
            }

            // Merge data
            const formattedSets = setsData?.map(set => ({
                ...set,
                profiles: profilesMap[set.created_by] || { full_name: 'Unknown', email: 'N/A' }
            })) || [];

            // Fetch stats
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            setSets(formattedSets);
            setStats({
                totalUsers: userCount || 0,
                totalSets: setsData?.length || 0,
                publicSets: setsData?.filter(s => s.is_public).length || 0
            });

        } catch (error: any) {
            console.error('Error fetching admin data:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            toast.error(`Failed to load admin data: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublic = async (set: any) => {
        try {
            const { error } = await supabase
                .from('vocabulary_sets')
                .update({ is_public: !set.is_public })
                .eq('id', set.id);

            if (error) throw error;

            toast.success(`Set ${set.is_public ? 'unpublished' : 'published'} successfully`);
            fetchData();
        } catch (error) {
            console.error('Error toggling public status:', error);
            toast.error('Failed to update set status');
        }
    };

    const handleDeleteSet = async () => {
        if (!setToDelete) return;

        try {
            const { error } = await supabase
                .from('vocabulary_sets')
                .delete()
                .eq('id', setToDelete.id);

            if (error) throw error;

            toast.success('Set deleted successfully');
            setConfirmDialogOpen(false);
            setSetToDelete(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting set:', error);
            toast.error('Failed to delete set');
        }
    };

    const handleUpdateSet = async (setId: string, updates: any) => {
        try {
            const { error } = await supabase
                .from('vocabulary_sets')
                .update(updates)
                .eq('id', setId);

            if (error) throw error;

            toast.success('Set updated successfully');
            fetchData();
        } catch (error) {
            console.error('Error updating set:', error);
            toast.error('Failed to update set');
            throw error;
        }
    };

    return (
        <Layout>
            <main className="px-4 sm:px-6 lg:px-8 xl:px-20 flex flex-1 justify-center py-8">
                <div className="layout-content-container flex flex-col w-full max-w-7xl flex-1 gap-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Dashboard</h1>
                        <button
                            onClick={fetchData}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-2xl">group</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Users</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <span className="material-symbols-outlined text-2xl">library_books</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Sets</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSets}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="material-symbols-outlined text-2xl">public</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Public Sets</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.publicSets}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sets Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vocabulary Sets Management</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        <th className="p-4 w-[40%]">Title</th>
                                        <th className="p-4 w-[20%]">Author</th>
                                        <th className="p-4 w-[20%]">Stats</th>
                                        <th className="p-4 w-[10%]">Status</th>
                                        <th className="p-4 w-[10%] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td>
                                        </tr>
                                    ) : sets.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">No sets found</td>
                                        </tr>
                                    ) : (
                                        sets.map((set) => (
                                            <tr key={set.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="min-w-[40px] h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl text-slate-600 dark:text-slate-400">
                                                            <span className="material-symbols-outlined">
                                                                {set.icon || 'library_books'}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-900 dark:text-white truncate">{set.title}</p>
                                                            <p className="text-xs text-slate-500 truncate">{set.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        <p className="text-slate-900 dark:text-white font-medium truncate">
                                                            {set.profiles?.full_name || 'Unknown'}
                                                        </p>
                                                        <p className="text-slate-500 text-xs truncate">{set.profiles?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                                        <p>{set.downloads || 0} downloads</p>
                                                        <p>{new Date(set.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleTogglePublic(set)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${set.is_public
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {set.is_public ? 'Public' : 'Private'}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSetToEdit(set);
                                                                setEditModalOpen(true);
                                                            }}
                                                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSetToDelete(set);
                                                                setConfirmDialogOpen(true);
                                                            }}
                                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <EditSetModal
                isOpen={editModalOpen}
                set={setToEdit}
                onClose={() => {
                    setEditModalOpen(false);
                    setSetToEdit(null);
                }}
                onSetUpdated={fetchData}
                onUpdate={handleUpdateSet}
            />

            <ConfirmDialog
                isOpen={confirmDialogOpen}
                title="Delete Set"
                message={`Are you sure you want to delete "${setToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteSet}
                onCancel={() => setConfirmDialogOpen(false)}
            />
        </Layout>
    );
};

export default AdminDashboard;
