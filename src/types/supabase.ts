export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
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
                    total_study_time: unknown
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
                    total_study_time?: unknown
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
                    total_study_time?: unknown
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
                    category: string | null
                    color_class: string | null
                    created_at: string
                    description: string | null
                    icon: string | null
                    id: string
                    is_public: boolean | null
                    level: string | null
                    title: string
                    topic: string | null
                    user_id: string
                }
                Insert: {
                    category?: string | null
                    color_class?: string | null
                    created_at?: string
                    description?: string | null
                    icon?: string | null
                    id?: string
                    is_public?: boolean | null
                    level?: string | null
                    title: string
                    topic?: string | null
                    user_id: string
                }
                Update: {
                    category?: string | null
                    color_class?: string | null
                    created_at?: string
                    description?: string | null
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
                    antonyms: string | null
                    created_at: string
                    example: string | null
                    id: string
                    image_url: string | null
                    meaning: string
                    phonetic: string | null
                    set_id: string
                    synonyms: string | null
                    type: string | null
                    word: string
                }
                Insert: {
                    antonyms?: string | null
                    created_at?: string
                    example?: string | null
                    id?: string
                    image_url?: string | null
                    meaning: string
                    phonetic?: string | null
                    set_id: string
                    synonyms?: string | null
                    type?: string | null
                    word: string
                }
                Update: {
                    antonyms?: string | null
                    created_at?: string
                    example?: string | null
                    id?: string
                    image_url?: string | null
                    meaning?: string
                    phonetic?: string | null
                    set_id?: string
                    synonyms?: string | null
                    type?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

type SchemaName = Exclude<keyof Database, "__InternalSupabase">

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: SchemaName },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: SchemaName
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: SchemaName }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: SchemaName },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: SchemaName
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: SchemaName
}
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: SchemaName },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: SchemaName
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: SchemaName
}
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: SchemaName },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: SchemaName
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: SchemaName
}
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: SchemaName },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: SchemaName
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: SchemaName
}
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
