import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { generateQuiz } from '../lib/aiGenerator';
import { QuizQuestion } from '../types';
import { awardXP, updateStreak, XP_REWARDS } from '../lib/gamification';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../hooks/useSound';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];
type Word = Database['public']['Tables']['words']['Row'];

const QuizPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const modeParam = searchParams.get('mode');
    const navigate = useNavigate();
    const { user } = useAuth();
    const sound = useSound();

    const [set, setSet] = useState<VocabularySet | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

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

                if (!wordsData || wordsData.length < 4) {
                    alert("Need at least 4 words to generate a quiz.");
                    navigate(`/sets/${id}`);
                    return;
                }

                // Only generate if mode is selected
                if (modeParam) {
                    if (modeParam === 'ai') {
                        setIsGenerating(true);
                        try {
                            const aiQuestions = await generateQuiz(wordsData, 5, 'multiple-choice');
                            setQuestions(aiQuestions);
                        } catch (error) {
                            console.error("AI Quiz Generation Error:", error);
                            alert("Failed to generate AI quiz. Falling back to standard mode.");
                            generateStandardQuiz(wordsData);
                        } finally {
                            setIsGenerating(false);
                        }
                    } else {
                        generateStandardQuiz(wordsData);
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, modeParam, navigate]);

    const generateStandardQuiz = (words: Word[]) => {
        const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 10); // Max 10 questions

        const generatedQuestions: QuizQuestion[] = shuffledWords.map(word => {
            // Pick 3 random distractors
            const distractors = words
                .filter(w => w.id !== word.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(w => w.meaning);

            const options = [...distractors, word.meaning].sort(() => 0.5 - Math.random());

            return {
                question: `What is the meaning of "${word.word}"?`,
                options,
                correctAnswer: word.meaning
            };
        });

        setQuestions(generatedQuestions);
    };

    const handleAnswerSelect = (option: string) => {
        if (selectedAnswer) return; // Prevent changing answer
        setSelectedAnswer(option);

        const isCorrect = option === questions[currentQuestionIndex].correctAnswer;

        // Play sound effect
        if (isCorrect) {
            sound.play.correct();
            setScore(prev => prev + 1);
        } else {
            sound.play.wrong();
        }

        // Auto advance after delay
        setTimeout(async () => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResults(true);
                sound.play.complete();

                // Award XP when quiz is completed
                if (user) {
                    const finalScore = isCorrect ? score + 1 : score;
                    const isPerfect = finalScore === questions.length;

                    await awardXP(user.id, XP_REWARDS.QUIZ_COMPLETED);
                    if (isPerfect) {
                        await awardXP(user.id, XP_REWARDS.QUIZ_PERFECT);
                        sound.play.levelUp();
                    } else {
                        sound.play.xpGain();
                    }
                    await updateStreak(user.id);
                }
            }
        }, 1500);
    };

    if (loading) {
        return (
            <Layout>
                <main className="flex flex-1 items-center justify-center flex-col gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-slate-500">Loading...</p>
                </main>
            </Layout>
        );
    }

    if (!set) return null;

    // Mode Selection Screen
    if (!modeParam) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Quiz Mode</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
                        Select how you want to test your knowledge.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                        <button
                            onClick={() => navigate(`/quiz/${id}?mode=standard`)}
                            className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all group text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">quiz</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Standard Quiz</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Classic multiple choice questions based on your word definitions.
                            </p>
                        </button>

                        <button
                            onClick={() => navigate(`/quiz/${id}?mode=ai`)}
                            className="flex flex-col items-center p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Generated</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Smart questions generated by AI to test context and usage.
                            </p>
                        </button>
                    </div>

                    <Link to={`/sets/${id}`} className="mt-12 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                        Cancel and go back
                    </Link>
                </div>
            </Layout>
        );
    }

    if (isGenerating) {
        return (
            <Layout>
                <main className="flex flex-1 items-center justify-center flex-col gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-slate-500">AI is crafting your quiz...</p>
                </main>
            </Layout>
        );
    }

    if (questions.length === 0) return null;

    if (showResults) {
        return (
            <Layout>
                <main className="flex flex-1 items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Quiz Complete!</h2>
                        <div className="text-6xl font-black text-primary mb-4">
                            {Math.round((score / questions.length) * 100)}%
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            You got {score} out of {questions.length} correct.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90"
                            >
                                Try Again
                            </button>
                            <Link
                                to={`/sets/${id}`}
                                className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
                            >
                                Back to Set
                            </Link>
                        </div>
                    </div>
                </main>
            </Layout>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Layout>
            <main className="flex flex-1 justify-center py-8 px-4">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <Link to={`/sets/${id}`} className="text-slate-500 hover:text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Exit Quiz
                        </Link>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            Question {currentQuestionIndex + 1}/{questions.length}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-8">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
                            {currentQuestion.question}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                let buttonStyle = "border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5";
                                if (selectedAnswer) {
                                    if (option === currentQuestion.correctAnswer) {
                                        buttonStyle = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                                    } else if (option === selectedAnswer) {
                                        buttonStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                                    } else {
                                        buttonStyle = "border-slate-200 dark:border-slate-700 opacity-50";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={selectedAnswer !== null}
                                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium text-lg ${buttonStyle}`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export default QuizPage;
