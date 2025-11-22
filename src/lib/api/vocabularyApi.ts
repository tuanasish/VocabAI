import { supabase } from '../supabaseClient';
import { Database } from '../../types/supabase';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];
type VocabularySetInsert = Database['public']['Tables']['vocabulary_sets']['Insert'];
type VocabularySetUpdate = Database['public']['Tables']['vocabulary_sets']['Update'];

export const vocabularyApi = {
    /**
     * Lấy tất cả vocabulary sets của user
     */
    async getAll(userId: string) {
        const { data, error } = await supabase
            .from('vocabulary_sets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Lấy một vocabulary set theo ID
     */
    async getById(setId: string) {
        const { data, error } = await supabase
            .from('vocabulary_sets')
            .select('*')
            .eq('id', setId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Tạo vocabulary set mới
     */
    async create(set: VocabularySetInsert) {
        const { data, error } = await supabase
            .from('vocabulary_sets')
            .insert(set)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Cập nhật vocabulary set
     */
    async update(setId: string, userId: string, updates: VocabularySetUpdate) {
        const { data, error } = await supabase
            .from('vocabulary_sets')
            .update(updates)
            .eq('id', setId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Xóa vocabulary set
     */
    async delete(setId: string, userId: string) {
        const { error } = await supabase
            .from('vocabulary_sets')
            .delete()
            .eq('id', setId)
            .eq('user_id', userId);

        if (error) throw error;
    }
};
