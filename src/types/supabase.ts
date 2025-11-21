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
                    daily_goal: number | null
                    full_name: string | null
                    id: string
                    last_study_date: string | null
                    level: number | null
                    streak_days: number | null
                    updated_at: string | null
                    xp: number | null
                }
                Insert: {
                    avatar_url?: string | null
                    daily_goal?: number | null
                    full_name?: string | null
                    id: string
                    last_study_date?: string | null
                    level?: number | null
                    streak_days?: number | null
                    updated_at?: string | null
                    xp?: number | null
                }
                Update: {
                    avatar_url?: string | null
                    daily_goal?: number | null
                    full_name?: string | null
                    id?: string
                    last_study_date?: string | null
                    level?: number | null
                    streak_days?: number | null
                    updated_at?: string | null
                    xp?: number | null
                }
                Relationships: []
            }
            user_achievements: {
                Row: {
                    achievement_id: string
                    id: string
                    unlocked_at: string
                    user_id: string
                }
                Insert: {
                    achievement_id: string
                    id?: string
                    unlocked_at?: string
                    user_id: string
                }
                Update: {
                    achievement_id?: string
                    id?: string
                    unlocked_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_achievements_achievement_id_fkey"
                        columns: ["achievement_id"]
                        isOneToOne: false
                        referencedRelation: "achievements"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_progress: {
                Row: {
                    created_at: string
                    ease_factor: number | null
                    id: string
                    interval: number | null
                    last_reviewed_at: string | null
                    next_review_at: string | null
                    repetitions: number | null
                    review_count: number | null
                    status: string | null
                    streak: number | null
                    total_study_time: string | null
                    user_id: string
                    word_id: string
                }
                Insert: {
                    created_at?: string
                    ease_factor?: number | null
                    id?: string
                    interval?: number | null
                    last_reviewed_at?: string | null
                    next_review_at?: string | null
                    repetitions?: number | null
                    review_count?: number | null
                    status?: string | null
                    streak?: number | null
                    total_study_time?: string | null
                    user_id: string
                    word_id: string
                }
                Update: {
                    created_at?: string
                    ease_factor?: number | null
                    id?: string
                    interval?: number | null
                    last_reviewed_at?: string | null
                    next_review_at?: string | null
                    repetitions?: number | null
                    review_count?: number | null
                    status?: string | null
                    streak?: number | null
                    total_study_time?: string | null
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
                    author_name: string | null
                    category: string | null
                    color_class: string | null
                    created_at: string
                    description: string | null
                    downloads: number | null
                    icon: string | null
                    id: string
                    is_public: boolean | null
                    level: string | null
                    title: string
                    topic: string | null
                    user_id: string
                }
                Insert: {
                    author_name?: string | null
                    category?: string | null
                    color_class?: string | null
                    created_at?: string
                    description?: string | null
                    downloads?: number | null
                    icon?: string | null
                    id?: string
                    is_public?: boolean | null
                    level?: string | null
                    title: string
                    topic?: string | null
                    user_id: string
                }
                Update: {
                    author_name?: string | null
                    category?: string | null
                    color_class?: string | null
                    created_at?: string
                    description?: string | null
                    downloads?: number | null
                    icon?: string | null
                    id?: string
                    is_public?: boolean | null
                    level?: string | null
                    title?: string
                    topic?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            words: {
                Row: {
                    created_at: string
                    example: string | null
                    id: string
                    image_url: string | null
                    meaning: string
                    part_of_speech: string | null
                    pronunciation: string | null
                    set_id: string
                    word: string
                }
                Insert: {
                    created_at?: string
                    example?: string | null
                    id?: string
                    image_url?: string | null
                    meaning: string
                    part_of_speech?: string | null
                    pronunciation?: string | null
                    set_id: string
                    word: string
                }
                Update: {
                    created_at?: string
                    example?: string | null
                    id?: string
                    image_url?: string | null
                    meaning?: string
                    part_of_speech?: string | null
                    pronunciation?: string | null
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
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
