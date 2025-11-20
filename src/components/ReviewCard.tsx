import React, { useState } from 'react';
import { WordWithProgress } from '../lib/api/progressApi';
import { ReviewRating, getRatingLabel } from '../lib/srsAlgorithm';
import { useSpeech } from '../hooks/useSpeech';

interface ReviewCardProps {
    word: WordWithProgress;
    onRate: (rating: ReviewRating) => void;
    showKeyboardHints?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ word, onRate, showKeyboardHints = true }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { speak } = useSpeech();

    const handleFlip = () => {
        setIsFlipped(true);
    };

    const handleRate = (rating: ReviewRating) => {
        onRate(rating);
        setIsFlipped(false); // Reset for next card
    };

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isFlipped) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleFlip();
                }
            } else {
                if (e.key === '1') handleRate(0);
                else if (e.key === '2') handleRate(1);
                else if (e.key === '3') handleRate(2);
                else if (e.key === '4') handleRate(3);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFlipped]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Flashcard */}
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 transition-all duration-300 ${isFlipped ? 'min-h-[400px]' : 'min-h-[300px]'
                    }`}
            >
                {!isFlipped ? (
                    /* Front of card - Word */
                    <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
                        <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                            {word.word}
                        </h2>

                        {word.phonetic && (
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-xl text-slate-600 dark:text-slate-400">
                                    {word.phonetic}
                                </span>
                                <button
                                    onClick={() => speak(word.word)}
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-2xl">volume_up</span>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleFlip}
                            className="mt-8 px-8 py-3 bg-primary text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
                        >
                            Show Answer
                        </button>

                        {showKeyboardHints && (
                            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                                Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">Space</kbd> to flip
                            </p>
                        )}
                    </div>
                ) : (
                    /* Back of card - Meaning & Details */
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                            {word.word}
                        </h2>

                        {word.phonetic && (
                            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                                {word.phonetic}
                            </p>
                        )}

                        <div className="space-y-4 mb-8">
                            <div>
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                    {word.type || 'Word'}
                                </span>
                                <p className="text-xl text-slate-900 dark:text-white mt-1">
                                    {word.meaning}
                                </p>
                            </div>

                            {word.example && (
                                <div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                        Example
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 mt-1 italic">
                                        "{word.example}"
                                    </p>
                                </div>
                            )}

                            {word.synonyms && (
                                <div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                        Synonyms
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 mt-1">
                                        {word.synonyms}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Rating Buttons */}
                        <div className="space-y-2">
                            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-3 font-medium">
                                How well did you recall this word?
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => handleRate(0)}
                                    className="py-3 px-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                                >
                                    <div className="text-sm">Again</div>
                                    {showKeyboardHints && <div className="text-xs opacity-75">Press 1</div>}
                                </button>
                                <button
                                    onClick={() => handleRate(1)}
                                    className="py-3 px-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-colors"
                                >
                                    <div className="text-sm">Hard</div>
                                    {showKeyboardHints && <div className="text-xs opacity-75">Press 2</div>}
                                </button>
                                <button
                                    onClick={() => handleRate(2)}
                                    className="py-3 px-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
                                >
                                    <div className="text-sm">Good</div>
                                    {showKeyboardHints && <div className="text-xs opacity-75">Press 3</div>}
                                </button>
                                <button
                                    onClick={() => handleRate(3)}
                                    className="py-3 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
                                >
                                    <div className="text-sm">Easy</div>
                                    {showKeyboardHints && <div className="text-xs opacity-75">Press 4</div>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;
