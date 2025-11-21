import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useSpeech } from '../hooks/useSpeech';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import AddWordModal from '../components/AddWordModal';
import EditWordModal from '../components/EditWordModal';
import EditSetModal from '../components/EditSetModal';
import ActionMenu from '../components/ActionMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { useWords } from '../lib/hooks/useWords';
import { useVocabularySets } from '../lib/hooks/useVocabularySets';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];
type Word = Database['public']['Tables']['words']['Row'];

const SetDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [set, setSet] = useState<VocabularySet | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
    const [isEditWordModalOpen, setIsEditWordModalOpen] = useState(false);
    const [isEditSetModalOpen, setIsEditSetModalOpen] = useState(false);
    const [wordToEdit, setWordToEdit] = useState<Word | null>(null);
    const [wordToDelete, setWordToDelete] = useState<string | null>(null);
    const { speak } = useSpeech();
    const { words, loading: wordsLoading, fetchWords, deleteWord, updateWord } = useWords(id);
    const { updateSet } = useVocabularySets();

    const fetchSet = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const { data: setData, error: setError } = await supabase
                .from('vocabulary_sets')
                .select('*')
                .eq('id', id)
                .single();

            if (setError) throw setError;
            setSet(setData);
        } catch (error) {
            console.error('Error fetching set details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditWord = (word: Word) => {
        setWordToEdit(word);
        setIsEditWordModalOpen(true);
    };

    const handleWordUpdated = () => {
        setIsEditWordModalOpen(false);
        setWordToEdit(null);
    };

    const handleDeleteWord = async () => {
        if (!wordToDelete) return;
        try {
            await deleteWord(wordToDelete);
            setWordToDelete(null);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleWordAdded = () => {
        fetchWords();
    };

    const handleSetUpdated = () => {
        fetchSet();
    };

    useEffect(() => {
        fetchSet();
    }, [id]);

    if (loading || wordsLoading) {
        return (
            <Layout>
                <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                </main>
            </Layout>
        );
    }

    if (!set) {
        return (
            <Layout>
                <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Set not found</h2>
                        <Link to="/dashboard" className="text-primary hover:underline">Go back to Dashboard</Link>
                    </div>
                </main>
            </Layout>
        );
    }

    return (
        <Layout>
            <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-8">
                <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1 gap-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2">
                        <Link to="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium">Home</Link>
                        <span className="text-slate-400 text-sm font-medium">/</span>
                        <Link to="/explore" className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium">Vocabulary Sets</Link>
                        <span className="text-slate-400 text-sm font-medium">/</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">{set.title}</span>
                    </div>

                    {/* Heading */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">{set.title}</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-base font-normal">{set.description}</p>
                    </div>

                    {/* Action Bar */}
                    {/* Study Center */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Flashcards', icon: 'style', path: `/practice/${set.id}`, color: 'bg-blue-500', desc: 'Review terms' },
                            { label: 'Quiz', icon: 'quiz', path: `/quiz/${set.id}`, color: 'bg-purple-500', desc: 'Test knowledge' },
                            { label: 'Roleplay', icon: 'theater_comedy', path: `/roleplay/${set.id}`, color: 'bg-pink-500', desc: 'AI Chat' },
                            { label: 'Story', icon: 'auto_stories', path: `/story/${set.id}`, color: 'bg-amber-500', desc: 'Context reading' },
                            { label: 'Speaking', icon: 'mic', path: `/speaking/${set.id}`, color: 'bg-emerald-500', desc: 'Pronunciation' },
                        ].map((mode) => (
                            <Link
                                key={mode.label}
                                to={mode.path}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-full ${mode.color} bg-opacity-10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <span className={`material-symbols-outlined text-2xl ${mode.color.replace('bg-', 'text-')}`}>{mode.icon}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white mb-1">{mode.label}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 text-center">{mode.desc}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Action Bar & Word List Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">list</span>
                            Word List ({words.length})
                        </h2>
                        <div className="flex items-center gap-3">
                            <ActionMenu
                                items={[
                                    {
                                        label: 'Edit Set',
                                        icon: 'edit',
                                        onClick: () => setIsEditSetModalOpen(true)
                                    },
                                    {
                                        label: 'Delete Set',
                                        icon: 'delete',
                                        variant: 'danger',
                                        onClick: () => {
                                            alert("To delete this set, please go to the Dashboard.");
                                        }
                                    }
                                ]}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-10 w-10 flex items-center justify-center"
                                triggerIcon="more_vert"
                            />
                            <button
                                onClick={() => setIsAddWordModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                <span>Add Word</span>
                            </button>
                        </div>
                    </div>

                    {/* Word List Table */}
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Word</th>
                                    <th className="px-6 py-4 font-medium hidden lg:table-cell">Phonetics</th>
                                    <th className="px-6 py-4 font-medium hidden md:table-cell">Type</th>
                                    <th className="px-6 py-4 font-medium">Meaning</th>
                                    <th className="px-6 py-4 font-medium hidden lg:table-cell">Example</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {words.length > 0 ? words.map((word) => (
                                    <tr key={word.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{word.word}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span>{word.phonetic || 'N/A'}</span>
                                                <button
                                                    className="text-slate-400 hover:text-primary"
                                                    onClick={() => speak(word.word)}
                                                >
                                                    <span className="material-symbols-outlined text-lg">volume_up</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">{word.type}</td>
                                        <td className="px-6 py-4 text-slate-800 dark:text-slate-300">{word.meaning}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 hidden lg:table-cell italic">{word.example || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditWord(word)}
                                                    className="text-slate-400 hover:text-primary transition-colors"
                                                    title="Edit word"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => setWordToDelete(word.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Delete word"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="material-symbols-outlined text-4xl text-slate-400">book</span>
                                                <p className="text-slate-500 dark:text-slate-400">No words in this set yet.</p>
                                                <button
                                                    onClick={() => setIsAddWordModalOpen(true)}
                                                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                                                >
                                                    Add Your First Word
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>



                <AddWordModal
                    isOpen={isAddWordModalOpen}
                    onClose={() => setIsAddWordModalOpen(false)}
                    onWordAdded={handleWordAdded}
                    setId={id!}
                />

                <EditWordModal
                    isOpen={isEditWordModalOpen}
                    word={wordToEdit}
                    onClose={() => setIsEditWordModalOpen(false)}
                    onWordUpdated={handleWordUpdated}
                    onUpdate={updateWord}
                />

                <EditSetModal
                    isOpen={isEditSetModalOpen}
                    set={set}
                    onClose={() => setIsEditSetModalOpen(false)}
                    onSetUpdated={handleSetUpdated}
                    onUpdate={updateSet}
                />

                <ConfirmDialog
                    isOpen={wordToDelete !== null}
                    title="Delete Word"
                    message="Are you sure you want to delete this word? This action cannot be undone."
                    onConfirm={handleDeleteWord}
                    onCancel={() => setWordToDelete(null)}
                />
            </main>
        </Layout>
    );
};

export default SetDetailsPage;