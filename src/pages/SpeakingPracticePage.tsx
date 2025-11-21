import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { useSpeech } from '../hooks/useSpeech';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];
type Word = Database['public']['Tables']['words']['Row'];

// Add support for Web Speech API types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const SpeakingPracticePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [set, setSet] = useState<VocabularySet | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const recognitionRef = useRef<any>(null);
    const { speak } = useSpeech();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const { data: setData, error: setError } = await supabase
                    .from('vocabulary_sets')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (setError) throw setError;
                setSet(setData);

                const { data: wordsData, error: wordsError } = await supabase
                    .from('words')
                    .select('*')
                    .eq('set_id', id);
                if (wordsError) throw wordsError;
                setWords(wordsData || []);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const currentTranscript = event.results[0][0].transcript;
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                checkPronunciation();
            };
        } else {
            alert("Your browser does not support speech recognition. Please use Chrome or Edge.");
        }
    }, [currentIndex, words]); // Re-initialize if needed, though mostly static

    const checkPronunciation = () => {
        if (!words[currentIndex]) return;
        const target = words[currentIndex].word.toLowerCase();
        // Use the current transcript state, but we might need the latest value from the event if onend fires after.
        // Actually, onend fires after onresult, so state should be updated.
        // However, due to closure, we need to be careful. 
        // Let's rely on the transcript state which might be slightly delayed, 
        // OR better: check inside onend if we can access the recognition object's last result? No.
        // Let's just use a ref for transcript to be safe or rely on the state update flow.
        // For simplicity, let's trigger check manually or via useEffect on isListening change?
    };

    // Better approach: Check when listening stops
    useEffect(() => {
        if (!isListening && transcript && words[currentIndex]) {
            const target = words[currentIndex].word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            const spoken = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

            if (spoken.includes(target) || target.includes(spoken)) {
                setFeedback('correct');
            } else {
                setFeedback('incorrect');
            }
        }
    }, [isListening, transcript]);

    const startListening = () => {
        if (recognitionRef.current) {
            setTranscript('');
            setFeedback('idle');
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const nextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setTranscript('');
            setFeedback('idle');
        }
    };

    const prevWord = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setTranscript('');
            setFeedback('idle');
        }
    };

    if (isLoading) return <Layout><div className="flex justify-center p-10">Loading...</div></Layout>;
    if (!set || words.length === 0) return <Layout><div className="flex justify-center p-10">No words found.</div></Layout>;

    const currentWord = words[currentIndex];

    return (
        <Layout>
            <div className="flex flex-col max-w-2xl mx-auto w-full px-4 py-8 h-[calc(100vh-64px)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to={`/sets/${id}`} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                    </Link>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pronunciation Coach</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{currentIndex + 1} / {words.length}</p>
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                {/* Card */}
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden">

                    {/* Feedback Overlay */}
                    {feedback !== 'idle' && (
                        <div className={`absolute inset-0 flex items-center justify-center bg-opacity-10 backdrop-blur-sm transition-all ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                            <div className={`p-6 rounded-full ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined text-6xl">
                                    {feedback === 'correct' ? 'check_circle' : 'cancel'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="text-center space-y-6 z-10">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{currentWord.word}</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">{currentWord.phonetic}</p>

                        <button
                            onClick={() => speak(currentWord.word)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined">volume_up</span>
                            Listen
                        </button>
                    </div>

                    <div className="mt-12 w-full max-w-md">
                        <div className="min-h-[60px] p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-center">
                            <p className={`text-lg ${transcript ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {transcript || "Hold the mic button and speak..."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <button
                            onMouseDown={startListening}
                            onMouseUp={stopListening}
                            onTouchStart={startListening}
                            onTouchEnd={stopListening}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${isListening
                                    ? 'bg-red-500 text-white shadow-red-500/30 scale-110'
                                    : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90'
                                }`}
                        >
                            <span className="material-symbols-outlined text-4xl">mic</span>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 px-4">
                    <button
                        onClick={prevWord}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <button
                        onClick={nextWord}
                        disabled={currentIndex === words.length - 1}
                        className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default SpeakingPracticePage;
