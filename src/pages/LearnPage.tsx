import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useProgress } from '../lib/hooks/useProgress';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import ReviewCard from '../components/ReviewCard';
import SessionSummary from '../components/SessionSummary';
import { ReviewRating } from '../lib/srsAlgorithm';
import { progressApi } from '../lib/api/progressApi';
import { useAuth } from '../contexts/AuthContext';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];

const LearnPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { dueWords, loading, fetchDueWords, recordReview } = useProgress();

    const [set, setSet] = useState<VocabularySet | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
    const [showSummary, setShowSummary] = useState(false);
    const [totalWords, setTotalWords] = useState(0); // Track initial count
    const [reviewStats, setReviewStats] = useState({
        again: 0,
        hard: 0,
        good: 0,
        easy: 0
    });

    // Fetch set details and due words
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // Fetch set details
            const { data: setData } = await supabase
                .from('vocabulary_sets')
                .select('*')
                .eq('id', id)
                .single();

            if (setData) setSet(setData);

            // Fetch words due for review
            await fetchDueWords(id);
            setSessionStartTime(Date.now());
        };

        fetchData();
    }, [id, fetchDueWords]);

    // Track total words when dueWords changes
    useEffect(() => {
        if (dueWords.length > 0 && totalWords === 0) {
            setTotalWords(dueWords.length);
        }
    }, [dueWords, totalWords]);

    const handleRate = async (rating: ReviewRating) => {
        const currentWord = dueWords[currentIndex];

        if (!currentWord) {
            console.error('No word at current index:', currentIndex, 'totalWords:', totalWords, 'dueWords.length:', dueWords.length);
            return;
        }

        try {
            console.log(`Rating word ${currentIndex + 1}/${totalWords}:`, currentWord.word, 'rating:', rating);

            // Record the review
            await recordReview(currentWord.id, rating);

            // Update stats
            const ratingKey = ['again', 'hard', 'good', 'easy'][rating] as keyof typeof reviewStats;
            setReviewStats(prev => ({
                ...prev,
                [ratingKey]: prev[ratingKey] + 1
            }));

            // Move to next word or show summary
            // Check against totalWords instead of dueWords.length
            if (currentIndex < totalWords - 1) {
                console.log('Moving to next word:', currentIndex + 1);
                setCurrentIndex(prev => prev + 1);
            } else {
                console.log('Session complete! Showing summary');
                setShowSummary(true);
            }
        } catch (error) {
            console.error('Error recording review:', error);
            // Don't break the flow, just show error
            alert(`Error: ${error instanceof Error ? error.message : 'Failed to record review'}`);
        }
    };

    const handleExit = () => {
        navigate(`/sets/${id}`);
    };

    const totalReviewed = Object.values(reviewStats).reduce((sum, val) => sum + val, 0);
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    if (loading) {
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

    // No words due for review
    if (dueWords.length === 0 && !showSummary) {
        const handleStartLearning = async () => {
            if (!id || !set || !user) return;

            try {
                // Fetch all words in this set
                const { data: allWords } = await supabase
                    .from('words')
                    .select('id')
                    .eq('set_id', id);

                if (!allWords || allWords.length === 0) {
                    return; // No words in set
                }

                // For each word, either create new progress or reset existing to today
                for (const word of allWords) {
                    try {
                        // Try to create new progress
                        await progressApi.initializeProgress(user.id, word.id);
                    } catch (err: any) {
                        // If already exists, update to make it due today
                        if (err.message?.includes('already exists') || err.code === '23505') {
                            await supabase
                                .from('user_progress')
                                .update({
                                    next_review_at: new Date().toISOString(),
                                    status: 'learning'
                                })
                                .eq('user_id', user.id)
                                .eq('word_id', word.id);
                        }
                    }
                }

                // Refresh to show words
                await fetchDueWords(id);
            } catch (error) {
                console.error('Error initializing words:', error);
            }
        };

        return (
            <Layout>
                <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-8">
                    <div className="w-full max-w-2xl text-center">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-12 border-2 border-slate-200 dark:border-slate-800">
                            <div className="inline-block p-6 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-6xl">
                                    celebration
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                All Caught Up!
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                                You have no words due for review in <span className="font-semibold">{set.title}</span> right now.
                            </p>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleStartLearning}
                                    className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                                >
                                    Start Learning All Words
                                </button>
                                <Link
                                    to={`/sets/${id}`}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors inline-block"
                                >
                                    Back to Set
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm inline-block"
                                >
                                    Go to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </Layout>
        );
    }

    return (
        <Layout>
            <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-8">
                <div className="w-full max-w-4xl">
                    {!showSummary ? (
                        <>
                            {/* Header */}
                            <div className="mb-8">
                                <Link
                                    to={`/sets/${id}`}
                                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-2 inline-flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Back to {set.title}
                                </Link>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                                    Review Session
                                </h1>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Progress: {currentIndex + 1} / {totalWords}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {totalWords > 0 ? Math.round(((currentIndex + 1) / totalWords) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-300"
                                        style={{ width: `${totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Review Card */}
                            {dueWords[currentIndex] && (
                                <ReviewCard
                                    word={dueWords[currentIndex]}
                                    onRate={handleRate}
                                    showKeyboardHints={true}
                                />
                            )}

                            {/* Stats Preview */}
                            <div className="mt-8 grid grid-cols-4 gap-4">
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{reviewStats.again}</div>
                                    <div className="text-xs text-red-600/70 dark:text-red-400/70">Again</div>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{reviewStats.hard}</div>
                                    <div className="text-xs text-orange-600/70 dark:text-orange-400/70">Hard</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{reviewStats.good}</div>
                                    <div className="text-xs text-green-600/70 dark:text-green-400/70">Good</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reviewStats.easy}</div>
                                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Easy</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <SessionSummary
                            totalReviewed={totalReviewed}
                            stats={reviewStats}
                            timeSpent={timeSpent}
                            onExit={handleExit}
                        />
                    )}
                </div>
            </main>
        </Layout>
    );
};

export default LearnPage;
