import { addDays } from 'date-fns';

/**
 * Review rating from user
 * 0 = Again (forgot completely)
 * 1 = Hard (difficult to recall)
 * 2 = Good (recalled correctly)  
 * 3 = Easy (very easy to recall)
 */
export type ReviewRating = 0 | 1 | 2 | 3;

export interface UserProgress {
    id: string;
    user_id: string;
    word_id: string;
    ease_factor: number;
    interval: number;
    repetitions: number;
    next_review_at: string;
    last_reviewed_at?: string;
    review_count: number;
    status: 'learning' | 'learned';
}

export interface ReviewResult {
    interval: number;        // days until next review
    repetitions: number;
    easeFactor: number;
    nextReviewAt: Date;
}

/**
 * SM-2 Algorithm Implementation
 * Based on SuperMemo 2 spaced repetition algorithm
 * 
 * @param currentProgress - Current progress state
 * @param rating - User rating (0-3): Again=0, Hard=1, Good=2, Easy=3
 * @returns Updated review parameters
 */
export function calculateNextReview(
    currentProgress: Partial<UserProgress>,
    rating: ReviewRating
): ReviewResult {
    const {
        ease_factor = 2.5,
        interval = 0,
        repetitions = 0
    } = currentProgress;

    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number;

    // Normalize rating to 0-5 scale for SuperMemo formula
    // 0 -> 0, 1 -> 2, 2 -> 3, 3 -> 4
    const normalizedRating = rating === 0 ? 0 : rating + 1;

    // Failed recall (rating < 2 means Again or Hard, we'll treat Again as fail)
    if (rating === 0) {
        // Reset: start over from the beginning
        newRepetitions = 0;
        newInterval = 1; // Review tomorrow
        // Decrease ease factor slightly for failures
        newEaseFactor = Math.max(1.3, ease_factor - 0.2);
    } else {
        // Successful recall
        newRepetitions = repetitions + 1;

        // Calculate new interval based on repetitions
        if (newRepetitions === 1) {
            newInterval = 1; // First successful review: 1 day
        } else if (newRepetitions === 2) {
            newInterval = 6; // Second successful review: 6 days
        } else {
            // Subsequent reviews: multiply previous interval by ease factor
            newInterval = Math.round(interval * ease_factor);
        }

        // Adjust interval based on difficulty rating
        if (rating === 1) {
            // Hard: increase interval less aggressively
            newInterval = Math.max(1, Math.round(newInterval * 0.7));
        } else if (rating === 3) {
            // Easy: increase interval more aggressively
            newInterval = Math.round(newInterval * 1.3);
        }

        // Calculate new ease factor using SuperMemo formula
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        // where q is the normalized quality of response (0-5)
        const efDelta = 0.1 - (5 - normalizedRating) * (0.08 + (5 - normalizedRating) * 0.02);
        newEaseFactor = Math.max(1.3, ease_factor + efDelta);
    }

    // Cap maximum interval at 365 days (1 year)
    newInterval = Math.min(newInterval, 365);

    const nextReviewAt = addDays(new Date(), newInterval);

    return {
        interval: newInterval,
        repetitions: newRepetitions,
        easeFactor: Number(newEaseFactor.toFixed(2)),
        nextReviewAt
    };
}

/**
 * Helper function to get review rating label
 */
export function getRatingLabel(rating: ReviewRating): string {
    const labels = {
        0: 'Again',
        1: 'Hard',
        2: 'Good',
        3: 'Easy'
    };
    return labels[rating];
}

/**
 * Helper function to get rating color for UI
 */
export function getRatingColor(rating: ReviewRating): string {
    const colors = {
        0: 'red',    // Again
        1: 'orange', // Hard
        2: 'green',  // Good
        3: 'blue'    // Easy
    };
    return colors[rating];
}
