import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useSpeech } from '../hooks/useSpeech';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type Word = Database['public']['Tables']['words']['Row'];
type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];

const FlashcardPracticePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [set, setSet] = useState<VocabularySet | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const { speak } = useSpeech();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate('/dashboard'); // Redirect if no ID
        return;
      }

      setLoading(true);
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
          .eq('set_id', id)
          .order('created_at', { ascending: true });

        if (wordsError) throw wordsError;
        setWords(wordsData || []);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowResults(false);
        setCorrectCount(0);
        setWrongCount(0);

      } catch (error) {
        console.error('Error fetching data:', error);
        // Optionally, show an error message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout hideHeader>
        <main className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </main>
      </Layout>
    );
  }

  if (!set || words.length === 0) {
    return (
      <Layout hideHeader>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No words to practice</h2>
            <Link to={`/sets/${id}`} className="text-primary hover:underline">Go back to set</Link>
          </div>
        </main>
      </Layout>
    );
  }

  const currentWord = words[currentIndex];

  // Auto-play audio when flipping to back (optional, good for learning)
  useEffect(() => {
    if (isFlipped && currentWord) {
      speak(currentWord.word);
    }
  }, [isFlipped, currentWord, speak]);

  const handleNext = useCallback((known: boolean) => {
    if (!set) return;

    if (known) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }
    setIsFlipped(false);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  }, [currentIndex, set, words.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext(true);
      } else if (e.code === 'ArrowLeft') {
        handleNext(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext]);

  if (showResults) {
    return (
      <Layout hideHeader>
        <main className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 font-display transition-colors duration-300">
          <div className="flex flex-col items-center justify-center flex-1 p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-center mb-6">Practice Complete!</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-lg font-medium">Correct</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-lg font-medium">Incorrect</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{wrongCount}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setCorrectCount(0);
                    setWrongCount(0);
                    setShowResults(false);
                    setIsFlipped(false);
                  }}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  Practice Again
                </button>
                <Link
                  to={`/sets/${id}`}
                  className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Back to Set
                </Link>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display transition-colors duration-300">\n      {/* Header / Toolbar */}
      <header className="flex justify-center w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex justify-between items-center gap-2 px-4 sm:px-6 lg:px-8 py-3 w-full max-w-5xl">
          <div className="flex items-center gap-2">
            <Link to={`/sets/${id}`} className="p-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="text-lg font-medium text-slate-800 dark:text-slate-200 truncate">Vocabulary Deck: {set.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mr-4">
              <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Space</kbd> Flip</span>
              <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">←</kbd> Don't Know</span>
              <span className="flex items-center gap-1"><kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">→</kbd> Know</span>
            </div>
            <button className="p-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-5 overflow-hidden relative">
        <div className="flex flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8 h-full z-0">

          {/* Progress Bar */}
          <div className="flex flex-col gap-2 py-4 w-full max-w-2xl mx-auto">
            <div className="flex gap-6 justify-between">
              <p className="text-slate-800 dark:text-slate-200 text-base font-medium">Deck Progress</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{currentIndex + 1}/{words.length}</p>
            </div>
            <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden">
              <div className="h-2 rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}% ` }}></div>
            </div>
          </div>

          {/* Flashcard Container */}
          <div className="flex-grow flex items-center justify-center p-4 perspective-1000">
            <div
              className={`w - full max - w - 2xl aspect - [3 / 2] relative transition - all duration - 500 transform - style - 3d cursor - pointer group ${isFlipped ? 'rotate-y-180' : ''} `}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front Side */}
              <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-center items-center p-8 text-center backface-hidden border border-slate-100 dark:border-slate-700 group-hover:shadow-lg transition-shadow" style={{ backfaceVisibility: 'hidden' }}>
                <div className="flex flex-col items-center justify-center gap-6">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Word</span>
                  <p className="text-slate-900 dark:text-white text-5xl sm:text-6xl font-black leading-tight tracking-[-0.02em]">{currentWord.word}</p>
                  <button
                    className="mt-4 w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                    onClick={(e) => { e.stopPropagation(); speak(currentWord.word); }}
                  >
                    <span className="material-symbols-outlined text-2xl">volume_up</span>
                  </button>
                </div>
                <div className="absolute bottom-8 text-slate-400 text-sm font-medium animate-pulse">
                  Click or Space to flip
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-between p-8 sm:p-12 backface-hidden border border-slate-100 dark:border-slate-700" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="text-left border-b border-slate-100 dark:border-slate-700 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-primary text-3xl font-bold mb-2">{currentWord.word}</p>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span className="italic font-serif">{currentWord.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="font-mono bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded text-sm">{currentWord.phonetic}</span>
                      </div>
                    </div>
                    <button
                      className="text-slate-400 hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(currentWord.word);
                      }}
                    >
                      <span className="material-symbols-outlined text-2xl">volume_up</span>
                    </button>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-center py-6">
                  <p className="text-slate-800 dark:text-slate-100 text-2xl sm:text-3xl font-medium leading-snug">{currentWord.meaning}</p>
                </div>

                <div className="text-left bg-slate-50 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                    <span className="font-bold text-primary mr-2">Ex:</span>
                    {currentWord.example}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6 pb-8 pt-2">
            <div className="flex gap-4 w-full max-w-md justify-center">
              <button
                onClick={() => handleNext(false)}
                className="flex-1 group flex cursor-pointer items-center justify-center rounded-2xl h-16 px-6 bg-white dark:bg-slate-800 border-2 border-orange-100 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col items-center">
                  <span className="text-orange-500 dark:text-orange-400 text-lg font-bold group-hover:scale-105 transition-transform">Still learning</span>
                  <span className="text-xs text-slate-400 font-medium">Key: ←</span>
                </div>
              </button>
              <button
                onClick={() => handleNext(true)}
                className="flex-1 group flex cursor-pointer items-center justify-center rounded-2xl h-16 px-6 bg-[#7ED321] hover:bg-[#71BD1D] text-white transition-all duration-200 shadow-lg shadow-green-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold group-hover:scale-105 transition-transform">I know this</span>
                  <span className="text-xs text-green-100 font-medium">Key: →</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default FlashcardPracticePage;