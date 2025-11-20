import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { QuizQuestion } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
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
    const [set, setSet] = useState<VocabularySet | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
    const [showQuizModal, setShowQuizModal] = useState(false);
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

    const handleGenerateQuiz = async () => {
        if (words.length === 0) {
            alert("This set has no words to generate a quiz from.");
            return;
        }

        setIsGeneratingQuiz(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const wordsString = words.map(w => `${w.word}: ${w.meaning}`).join(", ");

            const prompt = `Create a quiz with 3 multiple choice questions based on these words and meanings: ${wordsString}. Return JSON.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING }
                            },
                            required: ["question", "options", "correctAnswer"]
                        }
                    }
                }
            });

            if (response.text) {
                const questions = JSON.parse(response.text) as QuizQuestion[];
                setQuizQuestions(questions);
                setShowQuizModal(true);
            }

        } catch (error) {
            console.error("Error generating quiz:", error);
            alert("Failed to generate quiz. Please check your API key configuration.");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

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
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-auto">
                            <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 p-1.5">
                                {['Learn List', 'Flashcards', 'Quiz'].map((mode) => (
                                    <Link to={mode === 'Flashcards' ? `/practice/${set.id}` : mode === 'Learn List' ? `/learn/${set.id}` : '#'} key={mode} className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-medium transition-colors duration-200 ${mode === 'Learn List' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                        {mode}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex-grow hidden md:block"></div>
                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 items-center">
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
                                            // We need to implement delete set logic here or redirect to dashboard with delete intent
                                            // For now, let's just show an alert or handle it if we have the logic
                                            alert("To delete this set, please go to the Dashboard.");
                                        }
                                    }
                                ]}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 w-12 flex items-center justify-center"
                                triggerIcon="more_vert"
                            />
                            <button
                                onClick={() => setIsAddWordModalOpen(true)}
                                className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">add</span>
                                <span className="truncate">Add Word</span>
                            </button>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={isGeneratingQuiz || words.length === 0}
                                className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isGeneratingQuiz ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                                )}
                                <span className="truncate">{isGeneratingQuiz ? 'Generating...' : 'Generate quiz with AI'}</span>
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

                {/* Quiz Modal */}
                {showQuizModal && quizQuestions && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Generated Quiz</h2>
                                <button onClick={() => setShowQuizModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="space-y-6">
                                {quizQuestions.map((q, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <p className="font-medium text-lg mb-3 text-slate-900 dark:text-white">{idx + 1}. {q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className={`p-2 rounded border ${opt === q.correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-slate-200 dark:border-slate-700'}`}>
                                                    {opt} {opt === q.correctAnswer && '(Correct)'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setShowQuizModal(false)} className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 font-medium">Close</button>
                            </div>
                        </div>
                    </div>
                )}

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