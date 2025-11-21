import { supabase } from './supabaseClient';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Calculate XP to award based on activity type
 */
export const XP_REWARDS = {
    WORD_LEARNED: 10,
    QUIZ_COMPLETED: 50,
    QUIZ_PERFECT: 100,
    FLASHCARD_SESSION: 20,
    DAILY_GOAL_MET: 50,
    STREAK_MILESTONE_3: 30,
    STREAK_MILESTONE_7: 70,
    STREAK_MILESTONE_30: 300,
} as const;

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
    // Simple formula: Level = floor(XP / 100) + 1
    return Math.floor(xp / 100) + 1;
}

/**
 * Award XP to user and update level if needed
 */
export async function awardXP(userId: string, amount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        throw new Error('Failed to fetch profile');
    }

    const newXP = (profile.xp || 0) + amount;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > (profile.level || 1);

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXP, level: newLevel })
        .eq('id', userId);

    if (updateError) {
        throw new Error('Failed to update XP');
    }

    return { newXP, newLevel, leveledUp };
}

/**
 * Update streak based on last study date
 */
export async function updateStreak(userId: string): Promise<{ streakDays: number; isNewStreak: boolean }> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('streak_days, last_study_date')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        throw new Error('Failed to fetch profile');
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastStudyDate = profile.last_study_date;

    let newStreakDays = profile.streak_days || 0;
    let isNewStreak = false;

    if (!lastStudyDate) {
        // First time studying
        newStreakDays = 1;
        isNewStreak = true;
    } else if (lastStudyDate === today) {
        // Already studied today, no change
        return { streakDays: newStreakDays, isNewStreak: false };
    } else {
        const lastDate = new Date(lastStudyDate);
        const currentDate = new Date(today);
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            newStreakDays += 1;
            isNewStreak = true;
        } else {
            // Streak broken
            newStreakDays = 1;
            isNewStreak = true;
        }
    }

    // Update profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            streak_days: newStreakDays,
            last_study_date: today,
        })
        .eq('id', userId);

    if (updateError) {
        throw new Error('Failed to update streak');
    }

    // Award milestone XP
    if (newStreakDays === 3) {
        await awardXP(userId, XP_REWARDS.STREAK_MILESTONE_3);
    } else if (newStreakDays === 7) {
        await awardXP(userId, XP_REWARDS.STREAK_MILESTONE_7);
    } else if (newStreakDays === 30) {
        await awardXP(userId, XP_REWARDS.STREAK_MILESTONE_30);
    }

    return { streakDays: newStreakDays, isNewStreak };
}

/**
 * Check and award daily goal completion
 */
export async function checkDailyGoal(userId: string, wordsLearnedToday: number): Promise<boolean> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('daily_goal')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        return false;
    }

    const dailyGoal = profile.daily_goal || 20;

    if (wordsLearnedToday >= dailyGoal) {
        await awardXP(userId, XP_REWARDS.DAILY_GOAL_MET);
        return true;
    }

    return false;
}
