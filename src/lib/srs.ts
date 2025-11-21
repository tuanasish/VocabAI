import { supabase } from './supabaseClient';
import { Database } from '../types/supabase';

type UserProgress = Database['public']['Tables']['user_progress']['Row'];

/**
 * SM-2 Algorithm Implementation
 * Based on SuperMemo 2 algorithm for spaced repetition
 */

export enum ReviewQuality {
    AGAIN = 0,    // Complete blackout
    HARD = 1,     // Incorrect response, but correct one remembered
    GOOD = 2,     // Correct response with hesitation
    EASY = 3,     // Perfect response
}

interface SM2Result {
    interval: number;        // Days until next review
    easeFactor: number;      // Ease factor (difficulty)
    repetitions: number;     // Number of successful repetitions
    nextReviewDate: Date;    // Next review date
}

/**
 * Calculate next review using SM-2 algorithm
 */
export function calculateSM2(
    quality: ReviewQuality,
    currentInterval: number = 1,
    currentEaseFactor: number = 2.5,
    currentRepetitions: number = 0
): SM2Result {
    let easeFactor = currentEaseFactor;
    let interval = currentInterval;
    let repetitions = currentRepetitions;

    // Update ease factor
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
    );

    // Update repetitions and interval
    if (quality < ReviewQuality.GOOD) {
        // Failed review - reset
        repetitions = 0;
        interval = 1;
    } else {
        repetitions += 1;

        if (repetitions === 1) {
            interval = 1;
        } else if (repetitions === 2) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
        interval,
        easeFactor,
        repetitions,
        nextReviewDate,
    };
}

/**
 * Update user progress after reviewing a word
 */
export async function updateWordProgress(
    userId: string,
    wordId: string,
    quality: ReviewQuality
): Promise<void> {
    // Fetch current progress
    const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .single();

    let currentInterval = 1;
    let currentEaseFactor = 2.5;
    let currentRepetitions = 0;

    if (existingProgress) {
        currentInterval = existingProgress.interval || 1;
        currentEaseFactor = existingProgress.ease_factor || 2.5;
        currentRepetitions = existingProgress.repetitions || 0;
    }

    // Calculate new values using SM-2
    const sm2Result = calculateSM2(
        quality,
        currentInterval,
        currentEaseFactor,
        currentRepetitions
    );

    // Determine status
    const status = sm2Result.repetitions >= 3 ? 'learned' : 'learning';

    // Update or insert progress
    const progressData = {
        user_id: userId,
        word_id: wordId,
        interval: sm2Result.interval,
        ease_factor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        next_review_at: sm2Result.nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString(),
        review_count: (existingProgress?.review_count || 0) + 1,
        status,
    };

    if (existingProgress) {
        const { error: updateError } = await supabase
            .from('user_progress')
            .update(progressData)
            .eq('id', existingProgress.id);

        if (updateError) throw updateError;
    } else {
        const { error: insertError } = await supabase
            .from('user_progress')
            .insert(progressData);

        if (insertError) throw insertError;
    }
}

/**
 * Get words due for review today
 */
export async function getDueWords(userId: string, setId?: string): Promise<string[]> {
    let query = supabase
        .from('user_progress')
        .select('word_id, words(set_id)')
        .eq('user_id', userId)
        .lte('next_review_at', new Date().toISOString());

    if (setId) {
        query = query.eq('words.set_id', setId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data?.map(item => item.word_id) || [];
}

/**
 * Get review statistics for a user
 */
export async function getReviewStats(userId: string): Promise<{
    totalWords: number;
    wordsLearned: number;
    wordsLearning: number;
    wordsDueToday: number;
}> {
    const { data: allProgress, error: allError } = await supabase
        .from('user_progress')
        .select('status, next_review_at')
        .eq('user_id', userId);

    if (allError) throw allError;

    const totalWords = allProgress?.length || 0;
    const wordsLearned = allProgress?.filter(p => p.status === 'learned').length || 0;
    const wordsLearning = allProgress?.filter(p => p.status === 'learning').length || 0;

    const today = new Date().toISOString();
    const wordsDueToday = allProgress?.filter(
        p => p.next_review_at && p.next_review_at <= today
    ).length || 0;

    return {
        totalWords,
        wordsLearned,
        wordsLearning,
        wordsDueToday,
    };
}
