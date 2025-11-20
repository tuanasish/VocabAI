import React from 'react';
import { Link } from 'react-router-dom';

interface ReviewStats {
    again: number;
    hard: number;
    good: number;
    easy: number;
}

interface SessionSummaryProps {
    totalReviewed: number;
    stats: ReviewStats;
    timeSpent: number; // in seconds
    onContinue?: () => void;
    onExit: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
    totalReviewed,
    stats,
    timeSpent,
    onContinue,
    onExit
}) => {
    const accuracy = totalReviewed > 0
        ? Math.round(((stats.good + stats.easy) / totalReviewed) * 100)
        : 0;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const getMotivationalMessage = (): string => {
        if (accuracy >= 90) return "Outstanding! 🌟 You're mastering these words!";
        if (accuracy >= 75) return "Great job! 💪 Keep up the excellent work!";
        if (accuracy >= 60) return "Good progress! 📚 You're on the right track!";
        return "Keep practicing! 🎯 Every review helps you improve!";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">
                            check_circle
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Session Complete!
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {getMotivationalMessage()}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {totalReviewed}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Words Reviewed
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {accuracy}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Accuracy
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {formatTime(timeSpent)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Time Spent
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {stats.good + stats.easy}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Correct Recalls
                        </div>
                    </div>
                </div>

                {/* Rating Breakdown */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase">
                        Rating Breakdown
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium text-red-600 dark:text-red-400">Again</div>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-red-500 h-full flex items-center justify-end px-2 transition-all"
                                    style={{ width: `${totalReviewed > 0 ? (stats.again / totalReviewed) * 100 : 0}%` }}
                                >
                                    {stats.again > 0 && (
                                        <span className="text-xs text-white font-bold">{stats.again}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium text-orange-600 dark:text-orange-400">Hard</div>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-orange-500 h-full flex items-center justify-end px-2 transition-all"
                                    style={{ width: `${totalReviewed > 0 ? (stats.hard / totalReviewed) * 100 : 0}%` }}
                                >
                                    {stats.hard > 0 && (
                                        <span className="text-xs text-white font-bold">{stats.hard}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium text-green-600 dark:text-green-400">Good</div>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-green-500 h-full flex items-center justify-end px-2 transition-all"
                                    style={{ width: `${totalReviewed > 0 ? (stats.good / totalReviewed) * 100 : 0}%` }}
                                >
                                    {stats.good > 0 && (
                                        <span className="text-xs text-white font-bold">{stats.good}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium text-blue-600 dark:text-blue-400">Easy</div>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full flex items-center justify-end px-2 transition-all"
                                    style={{ width: `${totalReviewed > 0 ? (stats.easy / totalReviewed) * 100 : 0}%` }}
                                >
                                    {stats.easy > 0 && (
                                        <span className="text-xs text-white font-bold">{stats.easy}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {onContinue && (
                        <button
                            onClick={onContinue}
                            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity "
                        >
                            Continue Reviewing
                        </button>
                    )}
                    <button
                        onClick={onExit}
                        className={`${onContinue ? 'flex-1' : 'w-full'} bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors`}
                    >
                        {onContinue ? 'Exit' : 'Close'}
                    </button>
                </div>

                {/* Next Review Hint */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                    💡 Words will appear again based on how well you recalled them
                </p>
            </div>
        </div>
    );
};

export default SessionSummary;
