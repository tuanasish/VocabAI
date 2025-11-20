import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { generateVocabularySet, GeneratedWord } from '../lib/aiGenerator';

interface GenerateSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetCreated: () => void;
}

const GenerateSetModal: React.FC<GenerateSetModalProps> = ({ isOpen, onClose, onSetCreated }) => {
    const { user } = useAuth();
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
    const [wordCount, setWordCount] = useState(10);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatedWords, setGeneratedWords] = useState<GeneratedWord[] | null>(null);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [generatedCategory, setGeneratedCategory] = useState('');
    const [generatedIcon, setGeneratedIcon] = useState('auto_awesome');

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert('Please enter a topic');
            return;
        }

        setGenerating(true);
        try {
            const result = await generateVocabularySet(topic, level, wordCount);
            setGeneratedWords(result.words);
            setGeneratedTitle(result.title);
            setGeneratedDescription(result.description);
            setGeneratedCategory(result.category);
            setGeneratedIcon(result.icon || 'auto_awesome');
        } catch (error) {
            console.error('Error generating set:', error);
            alert('Failed to generate vocabulary set. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!user || !generatedWords) return;

        setSaving(true);
        try {
            // Create the set
            const { data: setData, error: setError } = await supabase
                .from('vocabulary_sets')
                .insert({
                    title: generatedTitle,
                    description: generatedDescription,
                    category: generatedCategory,
                    topic: topic,
                    level,
                    user_id: user.id,
                    icon: generatedIcon,
                    color_class: 'bg-purple-100 text-purple-700'
                })
                .select()
                .single();

            if (setError) throw setError;

            // Insert all words
            const wordsToInsert = generatedWords.map(word => ({
                word: word.word,
                phonetic: word.phonetic,
                type: word.type,
                meaning: word.meaning,
                example: word.example,
                set_id: setData.id
            }));

            const { error: wordsError } = await supabase
                .from('words')
                .insert(wordsToInsert);

            if (wordsError) throw wordsError;

            onSetCreated();
            handleClose();
        } catch (error) {
            console.error('Error saving set:', error);
            alert('Failed to save vocabulary set');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setTopic('');
        setLevel('Intermediate');
        setWordCount(10);
        setGeneratedWords(null);
        setGeneratedTitle('');
        setGeneratedDescription('');
        setGeneratedCategory('');
        setGeneratedIcon('auto_awesome');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Generate Vocabulary Set with AI</h2>
                    </div>
                    <button onClick={handleClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {!generatedWords ? (
                    <div className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic *</span>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Business English, Travel Vocabulary, IELTS Academic"
                                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                                disabled={generating}
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty Level</span>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value as any)}
                                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                                    disabled={generating}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Number of Words: {wordCount}</span>
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    value={wordCount}
                                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                                    className="w-full"
                                    disabled={generating}
                                />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                disabled={generating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !topic.trim()}
                                className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {generating && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                {generating ? 'Generating...' : 'Generate with AI'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{generatedTitle}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{generatedDescription}</p>
                            <div className="flex gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                    {generatedCategory}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                    {level}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                    {generatedWords.length} words
                                </span>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {generatedWords.map((word, index) => (
                                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-bold text-slate-900 dark:text-white">{word.word}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">{word.type}</span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">/{word.phonetic}/</span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">{word.meaning}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{word.example}"</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setGeneratedWords(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                disabled={saving}
                            >
                                Regenerate
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                {saving ? 'Saving...' : 'Save Vocabulary Set'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateSetModal;
