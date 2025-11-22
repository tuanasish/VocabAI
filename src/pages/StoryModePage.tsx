import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { generateStory } from '../lib/aiGenerator';
import { useSpeech } from '../hooks/useSpeech';
import toast from 'react-hot-toast';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];
type Word = Database['public']['Tables']['words']['Row'];

const StoryModePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [set, setSet] = useState<VocabularySet | null>(null);
    const [story, setStory] = useState<{ title: string; content: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { speak } = useSpeech();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Fetch set details
                const { data: setData, error: setError } = await supabase
                    .from('vocabulary_sets')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (setError) throw setError;
                setSet(setData);

                // Fetch words
                const { data: wordsData, error: wordsError } = await supabase
                    .from('words')
                    .select('*')
                    .eq('set_id', id);

                if (wordsError) throw wordsError;

                // Generate Story
                if (wordsData && wordsData.length > 0) {
                    const mappedWords = wordsData.map(w => ({
                        word: w.word,
                        meaning: w.definition
                    }));
                    const generatedStory = await generateStory(mappedWords);
                    setStory(generatedStory);
                }

            } catch (error) {
                console.error("Error initializing story mode:", error);
                toast.error("Failed to load story. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const renderStoryContent = (content: string) => {
        const parts = content.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                // This is a bolded word
                return (
                    <span
                        key={index}
                        onClick={() => speak(part)}
                        className="font-bold text-primary cursor-pointer hover:underline hover:bg-primary/10 rounded px-0.5 transition-colors"
                        title="Click to listen"
                    >
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Writing a story for you...</p>
                </div>
            </Layout>
        );
    }

    if (!set || !story) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <p className="text-slate-600 dark:text-slate-400">Failed to load story.</p>
                    <Link to={`/sets/${id}`} className="text-primary hover:underline mt-4">Back to Set</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col max-w-3xl mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to={`/sets/${id}`} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">auto_stories</span>
                            Story Mode
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Read and listen to words in context</p>
                    </div>
                </div>

                {/* Story Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6 text-center">{story.title}</h2>
                    <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed font-serif text-slate-700 dark:text-slate-300">
                        <p>{renderStoryContent(story.content)}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Generate New Story
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default StoryModePage;
