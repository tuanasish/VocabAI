import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { progressApi, WordWithProgress, UserStats } from '../api/progressApi';
import { useAuth } from '../../contexts/AuthContext';
import { ReviewRating } from '../srsAlgorithm';
import { Database } from '../../types/supabase';

type UserProgress = Database['public']['Tables']['user_progress']['Row'];

/**
 * Custom hook for managing word review progress and SRS
 */
export function useProgress() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dueWords, setDueWords] = useState<WordWithProgress[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);

    /**
     * Fetch words that are due for review today
     */
    const fetchDueWords = useCallback(async (setId?: string) => {
        if (!user) return;

        setLoading(true);
        try {
            const words = await progressApi.getDueWords(user.id, setId);
            setDueWords(words);
        } catch (err: any) {
            console.error('Error fetching due words:', err);
            const errorMessage = err.message || 'Failed to load review words';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Record a review and update progress
     */
    const recordReview = async (
        wordId: string,
        rating: ReviewRating,
        studyTimeSeconds?: number
    ): Promise<UserProgress | null> => {
        if (!user) return null;

        try {
            const result = await progressApi.recordReview(
                user.id,
                wordId,
                rating,
                studyTimeSeconds
            );

            // Don't remove word from array - let parent component handle navigation
            // setDueWords(prev => prev.filter(w => w.id !== wordId));

            // Show success toast with next review info
            const ratingLabels = ['again', 'with some difficulty', 'correctly', 'easily'];
            toast.success(`Recalled ${ratingLabels[rating]}! Next review in ${result.interval} day(s).`);

            return result;
        } catch (err: any) {
            console.error('Error recording review:', err);
            const errorMessage = err.message || 'Failed to save review';
            toast.error(errorMessage);
            throw err;
        }
    };

    /**
     * Initialize progress for a new word (start learning)
     */
    const startLearning = async (wordId: string): Promise<UserProgress | null> => {
        if (!user) return null;

        try {
            const progress = await progressApi.initializeProgress(user.id, wordId);
            toast.success('Word added to learning queue!');
            return progress;
        } catch (err: any) {
            console.error('Error starting learning:', err);
            const errorMessage = err.message || 'Failed to start learning';
            toast.error(errorMessage);
            throw err;
        }
    };

    /**
     * Fetch user statistics
     */
    const fetchStats = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const userStats = await progressApi.getStats(user.id);
            setStats(userStats);
        } catch (err: any) {
            console.error('Error fetching stats:', err);
            const errorMessage = err.message || 'Failed to load statistics';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Get progress for a specific word
     */
    const getWordProgress = async (wordId: string): Promise<UserProgress | null> => {
        if (!user) return null;

        try {
            return await progressApi.getByWordId(user.id, wordId);
        } catch (err: any) {
            console.error('Error fetching word progress:', err);
            return null;
        }
    };

    return {
        loading,
        dueWords,
        stats,
        fetchDueWords,
        recordReview,
        startLearning,
        fetchStats,
        getWordProgress
    };
}
