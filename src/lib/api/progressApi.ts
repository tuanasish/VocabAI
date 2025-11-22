import { supabase } from '../supabaseClient';
import { Database } from '../../types/supabase';
import { calculateNextReview, ReviewRating } from '../srsAlgorithm';

type UserProgress = Database['public']['Tables']['user_progress']['Row'];
type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert'];
type UserProgressUpdate = Database['public']['Tables']['user_progress']['Update'];
type Word = Database['public']['Tables']['words']['Row'];

export interface WordWithProgress extends Word {
    progress?: UserProgress;
}

export interface UserStats {
    totalWords: number;
    wordsLearned: number;
    wordsLearning: number;
    wordsDueToday: number;
    currentStreak: number;
    reviewAccuracy: number;
    totalReviewTime: string; // interval as string
}

export interface SetProgress {
    totalWords: number;
    wordsLearned: number;
    wordsLearning: number;
    wordsDueToday: number;
    progressPercentage: number; // (learned + learning) / total * 100
}

export const progressApi = {
    /**
     * Get all progress records for a user
     */
    async getByUserId(userId: string): Promise<UserProgress[]> {
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get progress for a specific word
     */
    async getByWordId(userId: string, wordId: string): Promise<UserProgress | null> {
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('word_id', wordId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
        return data;
    },

    /**
     * Get words due for review today
     */
    async getDueWords(userId: string, setId?: string): Promise<WordWithProgress[]> {
        let query = supabase
            .from('user_progress')
            .select(`
                *,
                word:words(*)
            `)
            .eq('user_id', userId)
            .lte('next_review_at', new Date().toISOString())
            .eq('status', 'learning')
            .order('next_review_at', { ascending: true })
            .limit(20);

        if (setId) {
            // Need to filter by set_id through the words table
            query = query.eq('words.set_id', setId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to match WordWithProgress interface
        if (!data) return [];

        return data.map((progress: any) => ({
            ...progress.word,
            progress: {
                id: progress.id,
                user_id: progress.user_id,
                word_id: progress.word_id,
                ease_factor: progress.ease_factor,
                interval: progress.interval,
                repetitions: progress.repetitions,
                next_review_at: progress.next_review_at,
                last_reviewed_at: progress.last_reviewed_at,
                review_count: progress.review_count,
                status: progress.status,
                streak: progress.streak,
                created_at: progress.created_at,
                total_study_time: progress.total_study_time
            }
        })).filter(w => w.id); // Filter out any null words
    },

    /**
     * Record a review and update progress using SRS algorithm
     */
    async recordReview(
        userId: string,
        wordId: string,
        rating: ReviewRating,
        studyTimeSeconds: number = 0
    ): Promise<UserProgress> {
        // Get current progress
        let currentProgress = await this.getByWordId(userId, wordId);

        // Calculate next review using SM-2 algorithm
        const reviewResult = calculateNextReview(currentProgress || {}, rating);

        const updates: UserProgressUpdate = {
            last_reviewed_at: new Date().toISOString(),
            next_review_at: reviewResult.nextReviewAt.toISOString(),
            interval: reviewResult.interval,
            repetitions: reviewResult.repetitions,
            ease_factor: reviewResult.easeFactor,
            review_count: (currentProgress?.review_count || 0) + 1,
            status: reviewResult.repetitions >= 3 ? 'learned' : 'learning',
            // Note: total_study_time is interval type, needs special handling
        };

        if (currentProgress) {
            // Update existing progress
            const { data, error } = await supabase
                .from('user_progress')
                .update(updates)
                .eq('id', currentProgress.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Create new progress record
            const insert: UserProgressInsert = {
                user_id: userId,
                word_id: wordId,
                ...updates,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('user_progress')
                .insert(insert)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    /**
     * Get user statistics
     */
    async getStats(userId: string): Promise<UserStats> {
        // Get all progress
        const allProgress = await this.getByUserId(userId);

        // Calculate stats
        const wordsLearned = allProgress.filter(p => p.status === 'learned').length;
        const wordsLearning = allProgress.filter(p => p.status === 'learning').length;

        const now = new Date();
        const wordsDueToday = allProgress.filter(p =>
            p.next_review_at && new Date(p.next_review_at) <= now
        ).length;

        // Calculate review accuracy (% of good/easy ratings)
        const totalReviews = allProgress.reduce((sum, p) => sum + (p.review_count || 0), 0);

        return {
            totalWords: allProgress.length,
            wordsLearned,
            wordsLearning,
            wordsDueToday,
            currentStreak: 0, // TODO: Implement streak calculation
            reviewAccuracy: 0, // TODO: Track rating history
            totalReviewTime: '0 seconds'
        };
    },

    /**
     * Initialize progress for a word (mark as learning)
     */
    async initializeProgress(userId: string, wordId: string): Promise<UserProgress> {
        const insert: UserProgressInsert = {
            user_id: userId,
            word_id: wordId,
            status: 'learning',
            ease_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review_at: new Date().toISOString(), // Due immediately
            review_count: 0
        };

        const { data, error } = await supabase
            .from('user_progress')
            .insert(insert)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get progress statistics for a specific vocabulary set
     */
    async getSetProgress(userId: string, setId: string): Promise<SetProgress> {
        // Get all words in the set
        const { data: words, error: wordsError } = await supabase
            .from('words')
            .select('id')
            .eq('set_id', setId);

        if (wordsError) throw wordsError;

        const totalWords = words?.length || 0;

        if (totalWords === 0) {
            return {
                totalWords: 0,
                wordsLearned: 0,
                wordsLearning: 0,
                wordsDueToday: 0,
                progressPercentage: 0
            };
        }

        // Get progress for all words in the set
        const wordIds = words.map(w => w.id);
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .in('word_id', wordIds);

        if (progressError) throw progressError;

        const progress = progressData || [];
        const wordsLearned = progress.filter(p => p.status === 'learned').length;
        const wordsLearning = progress.filter(p => p.status === 'learning').length;

        const now = new Date();
        const wordsDueToday = progress.filter(p =>
            p.next_review_at && new Date(p.next_review_at) <= now
        ).length;

        const progressPercentage = totalWords > 0
            ? Math.round(((wordsLearned + wordsLearning) / totalWords) * 100)
            : 0;

        return {
            totalWords,
            wordsLearned,
            wordsLearning,
            wordsDueToday,
            progressPercentage
        };
    },

    /**
     * Get the last studied vocabulary set with progress data
     */
    async getLastStudiedSet(userId: string): Promise<{
        setId: string;
        setTitle: string;
        setDescription: string | null;
        imageUrl: string | null;
        progress: number;
        wordsDue: number;
        totalWords: number;
        lastReviewedAt: string;
    } | null> {
        // Get the most recent progress record
        const { data: lastProgress, error: progressError } = await supabase
            .from('user_progress')
            .select(`
                *,
                word:words(
                    *,
                    vocabulary_set:vocabulary_sets(*)
                )
            `)
            .eq('user_id', userId)
            .not('last_reviewed_at', 'is', null)
            .order('last_reviewed_at', { ascending: false })
            .limit(1)
            .single();

        if (progressError || !lastProgress || !lastProgress.word) {
            return null;
        }

        const word: any = lastProgress.word;
        const set: any = word.vocabulary_set;

        if (!set) return null;

        // Get full progress for this set
        const setProgress = await this.getSetProgress(userId, set.id);

        return {
            setId: set.id,
            setTitle: set.title,
            setDescription: set.description,
            imageUrl: set.image_url,
            progress: setProgress.progressPercentage,
            wordsDue: setProgress.wordsDueToday,
            totalWords: setProgress.totalWords,
            lastReviewedAt: lastProgress.last_reviewed_at || new Date().toISOString()
        };
    }
};
