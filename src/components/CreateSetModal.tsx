import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface CreateSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetCreated: () => void;
}

const CreateSetModal: React.FC<CreateSetModalProps> = ({ isOpen, onClose, onSetCreated }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [level, setLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('vocabulary_sets').insert({
                title,
                description,
                category,
                level,
                user_id: user.id,
                icon: 'school', // Default icon for now
                color_class: 'bg-blue-100 text-blue-700' // Default color
            });

            if (error) throw error;

            onSetCreated();
            onClose();
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error creating set:', error);
            alert('Failed to create set');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Set</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., IELTS Unit 1"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this set about?"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="General">General</option>
                                <option value="Academic">Academic</option>
                                <option value="Business">Business</option>
                                <option value="Travel">Travel</option>
                                <option value="Technology">Technology</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Level</span>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                            Create Set
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSetModal;
