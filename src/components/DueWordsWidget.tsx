import React from 'react';
import { Link } from 'react-router-dom';

interface DueWordsWidgetProps {
    wordsDue: number;
    loading?: boolean;
    firstSetWithDueWords?: string; // Set ID to navigate to
}

const DueWordsWidget: React.FC<DueWordsWidgetProps> = ({
    wordsDue,
    loading = false,
    firstSetWithDueWords
}) => {
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 border-2 border-primary/20 dark:border-primary/30">
                <div className="flex items-center justify-center h-32">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (wordsDue === 0) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">
                                celebration
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                            All Caught Up! 🎉
                        </h3>
                        <p className="text-green-700 dark:text-green-300">
                            You have no words due for review today. Great job!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 border-2 border-primary/20 dark:border-primary/30 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-primary dark:text-primary-light text-5xl">
                            school
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Words Due Today
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-primary dark:text-primary-light">
                            {wordsDue}
                        </span>
                        <span className="text-lg text-slate-600 dark:text-slate-400">
                            {wordsDue === 1 ? 'word' : 'words'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Keep your streak going! Review now to master your vocabulary.
                    </p>
                </div>

                {/* Action Button */}
                {firstSetWithDueWords && (
                    <div className="flex-shrink-0">
                        <Link
                            to={`/learn/${firstSetWithDueWords}`}
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                            <span>Review Now</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DueWordsWidget;
