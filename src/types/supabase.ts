export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            achievements: {
                Row: {
                    code: string
                    condition_type: string | null
                    condition_value: number | null
                    created_at: string
                    description: string | null
                    icon: string | null
                    id: string
                    name: string
                    xp_reward: number | null
                }
                Insert: {
                    code: string
                    condition_type?: string | null
                    condition_value?: number | null
                    created_at?: string
                    description?: string | null
                    icon?: string | null
                    id?: string
                    name: string
                    xp_reward?: number | null
                }
                Update: {
                    code?: string
                    condition_type?: string | null
                    condition_value?: number | null
                    created_at?: string
                    description?: string | null
                    icon?: string | null
                    id?: string
                    name?: string
                    xp_reward?: number | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    best_streak: number | null
                    daily_goal: number | null
                    full_name: string | null
                    id: string
                    last_study_date: string | null
                    level: number | null
                    notifications_enabled: boolean | null
                    streak_days: number | null
                    theme_preference: string | null
                    updated_at: string | null
                    xp: number | null
                }
                Insert: {
                    avatar_url?: string | null
                    best_streak?: number | null
                    daily_goal?: number | null
                    full_name?: string | null
                    id: string
                    last_study_date?: string | null
                    level?: number | null
                    notifications_enabled?: boolean | null
                    streak_days?: number | null
                    theme_preference?: string | null
                    updated_at?: string | null
                    xp?: number | null
                }
                Update: {
                    avatar_url?: string | null
                    best_streak?: number | null
                    daily_goal?: number | null
                    full_name?: string | null
                    id?: string
                    last_study_date?: string | null
                    level?: number | null
                    notifications_enabled?: boolean | null
                    streak_days?: number | null
                    theme_preference?: string | null
                    updated_at?: string | null
                    xp?: number | null
                }
                Relationships: []
            }
            user_progress: {
                Row: {
                    created_at: string
                    ease_factor: number
                    id: string
                    interval: number
                    last_reviewed_at: string | null
                    next_review_at: string
                    repetitions: number
                    review_count: number
                    status: string
                    streak: number
                    total_study_time: number
                    user_id: string
                    word_id: string
                }
                Insert: {
                    created_at?: string
                    ease_factor?: number
                    id?: string
                    interval?: number
                    last_reviewed_at?: string | null
                    next_review_at?: string
                    repetitions?: number
                    review_count?: number
                    status?: string
                    streak?: number
                    total_study_time?: number
                    user_id: string
                    word_id: string
                }
                Update: {
                    created_at?: string
                    ease_factor?: number
                    id?: string
                    interval?: number
                    last_reviewed_at?: string | null
                    next_review_at?: string
                    repetitions?: number
                    review_count?: number
                    status?: string
                    streak?: number
                    total_study_time?: number
                    user_id?: string
                    word_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_progress_word_id_fkey"
                        columns: ["word_id"]
                        isOneToOne: false
                        referencedRelation: "words"
                        referencedColumns: ["id"]
                    },
                ]
            }
            vocabulary_sets: {
                Row: {
                    category: string
                    created_at: string
                    created_by: string | null
                    description: string | null
                    difficulty_level: string
                    id: string
                    image_url: string | null
                    is_public: boolean
                    target_audience: string | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    category: string
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    difficulty_level: string
                    id?: string
                    image_url?: string | null
                    is_public?: boolean
                    target_audience?: string | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    category?: string
                    created_at?: string
                    created_by?: string | null
                    description?: string | null
                    difficulty_level?: string
                    id?: string
                    image_url?: string | null
                    is_public?: boolean
                    target_audience?: string | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            words: {
                Row: {
                    audio_url: string | null
                    created_at: string
                    definition: string
                    example_sentence: string | null
                    id: string
                    image_url: string | null
                    part_of_speech: string
                    phonetic: string | null
                    set_id: string
                    word: string
                }
                Insert: {
                    audio_url?: string | null
                    created_at?: string
                    definition: string
                    example_sentence?: string | null
                    id?: string
                    image_url?: string | null
                    part_of_speech: string
                    phonetic?: string | null
                    set_id: string
                    word: string
                }
                Update: {
                    audio_url?: string | null
                    created_at?: string
                    definition?: string
                    example_sentence?: string | null
                    id?: string
                    image_url?: string | null
                    part_of_speech?: string
                    phonetic?: string | null
                    set_id?: string
                    word?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "words_set_id_fkey"
                        columns: ["set_id"]
                        isOneToOne: false
                        referencedRelation: "vocabulary_sets"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            id: string
            last_study_date: string | null
            level: number | null
            notifications_enabled: boolean | null
            streak_days: number | null
            theme_preference: string | null
            updated_at: string | null
            xp: number | null
        }
        Insert: {
            avatar_url?: string | null
            best_streak?: number | null
            daily_goal?: number | null
            full_name?: string | null
            id: string
            last_study_date?: string | null
            level?: number | null
            notifications_enabled?: boolean | null
            streak_days?: number | null
            theme_preference?: string | null
            updated_at?: string | null
            xp?: number | null
        }
        Update: {
            avatar_url?: string | null
            best_streak?: number | null
            daily_goal?: number | null
            full_name?: string | null
            id?: string
            last_study_date?: string | null
            level?: number | null
            notifications_enabled?: boolean | null
            streak_days?: number | null
            theme_preference?: string | null
            updated_at?: string | null
            xp?: number | null
        }
        Relationships: []
    }
    user_progress: {
        Row: {
            created_at: string
            ease_factor: number
            id: string
            interval: number
            last_reviewed_at: string | null
            next_review_at: string
            repetitions: number
            review_count: number
            status: string
            streak: number
            total_study_time: number
            user_id: string
            word_id: string
        }
        Insert: {
            created_at?: string
            ease_factor?: number
            id?: string
            interval?: number
            last_reviewed_at?: string | null
            next_review_at?: string
            repetitions?: number
            review_count?: number
            status?: string
            streak?: number
            total_study_time?: number
            user_id: string
            word_id: string
        }
        Update: {
            created_at?: string
            ease_factor?: number
            id?: string
            interval?: number
            last_reviewed_at?: string | null
            next_review_at?: string
            repetitions?: number
            review_count?: number
            status?: string
            streak?: number
            total_study_time?: number
            user_id?: string
            word_id?: string
        }
        Relationships: [
            {
                foreignKeyName: "user_progress_word_id_fkey"
                columns: ["word_id"]
                isOneToOne: false
                referencedRelation: "words"
                referencedColumns: ["id"]
            },
        ]
    }
    vocabulary_sets: {
        Row: {
            category: string
            created_at: string
            created_by: string | null
            description: string | null
            difficulty_level: string
            id: string
            image_url: string | null
            is_public: boolean
            target_audience: string | null
            title: string
            updated_at: string | null
        }
        Insert: {
            category: string
            created_at?: string
            created_by?: string | null
            description?: string | null
            difficulty_level: string
            id?: string
            image_url?: string | null
            is_public?: boolean
            target_audience?: string | null
            title: string
            updated_at?: string | null
        }
        Update: {
            category?: string
            created_at?: string
            created_by?: string | null
            description?: string | null
            difficulty_level?: string
            id?: string
            image_url?: string | null
            is_public?: boolean
            target_audience?: string | null
            title?: string
            updated_at?: string | null
        }
        Relationships: []
    }
    words: {
        Row: {
            audio_url: string | null
            created_at: string
            definition: string
            example_sentence: string | null
            id: string
            image_url: string | null
            part_of_speech: string
            phonetic: string | null
            set_id: string
            word: string
        }
        Insert: {
            audio_url?: string | null
            created_at?: string
            definition: string
            example_sentence?: string | null
            id?: string
            image_url?: string | null
            part_of_speech: string
            phonetic?: string | null
            set_id: string
            word: string
        }
        Update: {
            audio_url?: string | null
            created_at?: string
            definition?: string
            example_sentence?: string | null
            id?: string
            image_url?: string | null
            part_of_speech?: string
            phonetic?: string | null
            set_id?: string
            word?: string
        }
        Relationships: [
            {
                foreignKeyName: "words_set_id_fkey"
                columns: ["set_id"]
                isOneToOne: false
                referencedRelation: "vocabulary_sets"
                referencedColumns: ["id"]
            },
        ]
    }
}


export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
