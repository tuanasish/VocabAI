import React, { useState, useEffect } from 'react';
import { Database } from '../types/supabase';

type Word = Database['public']['Tables']['words']['Row'];

interface EditWordModalProps {
    isOpen: boolean;
    word: Word | null;
    onClose: () => void;
    onWordUpdated: () => void;
    onUpdate: (wordId: string, updates: any) => Promise<void>;
}

const EditWordModal: React.FC<EditWordModalProps> = ({ isOpen, word, onClose, onWordUpdated, onUpdate }) => {
    const [wordText, setWordText] = useState('');
    const [phonetic, setPhonetic] = useState('');
    const [type, setType] = useState('noun');
    const [meaning, setMeaning] = useState('');
    const [example, setExample] = useState('');
    const [synonyms, setSynonyms] = useState('');
    const [antonyms, setAntonyms] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (word) {
            setWordText(word.word);
            setPhonetic(word.phonetic || '');
            setType(word.type || 'noun');
            setMeaning(word.meaning);
            setExample(word.example || '');
            setSynonyms(word.synonyms || '');
            setAntonyms(word.antonyms || '');
        }
    }, [word]);

    if (!isOpen || !word) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            await onUpdate(word.id, {
                word: wordText,
                phonetic,
                type,
                meaning,
                example,
                synonyms,
                antonyms
            });

            onWordUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating word:', error);
            // Error already handled by useWords hook with toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Word</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Word *</span>
                        <input
                            type="text"
                            value={wordText}
                            onChange={(e) => setWordText(e.target.value)}
                            placeholder="e.g., serendipity"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phonetic</span>
                        <input
                            type="text"
                            value={phonetic}
                            onChange={(e) => setPhonetic(e.target.value)}
                            placeholder="e.g., /ˌserənˈdɪpɪti/"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type *</span>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        >
                            <option value="noun">Noun</option>
                            <option value="verb">Verb</option>
                            <option value="adjective">Adjective</option>
                            <option value="adverb">Adverb</option>
                            <option value="preposition">Preposition</option>
                            <option value="conjunction">Conjunction</option>
                            <option value="interjection">Interjection</option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Meaning *</span>
                        <textarea
                            value={meaning}
                            onChange={(e) => setMeaning(e.target.value)}
                            placeholder="Definition of the word"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Example</span>
                        <textarea
                            value={example}
                            onChange={(e) => setExample(e.target.value)}
                            placeholder="An example sentence"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Synonyms</span>
                        <input
                            type="text"
                            value={synonyms}
                            onChange={(e) => setSynonyms(e.target.value)}
                            placeholder="Comma-separated synonyms"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Antonyms</span>
                        <input
                            type="text"
                            value={antonyms}
                            onChange={(e) => setAntonyms(e.target.value)}
                            placeholder="Comma-separated antonyms"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </label>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border-2 border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditWordModal;
