import { supabase } from '../supabaseClient';
import { Database } from '../../types/supabase';

type Word = Database['public']['Tables']['words']['Row'];
type WordInsert = Database['public']['Tables']['words']['Insert'];
type WordUpdate = Database['public']['Tables']['words']['Update'];

export const wordsApi = {
    /**
     * Lấy tất cả words trong một vocabulary set
     */
    async getBySetId(setId: string) {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('set_id', setId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Tạo word mới
     */
    async create(word: WordInsert) {
        const { data, error } = await supabase
            .from('words')
            .insert(word)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Cập nhật word
     */
    async update(wordId: string, updates: WordUpdate) {
        const { data, error } = await supabase
            .from('words')
            .update(updates)
            .eq('id', wordId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Xóa word
     */
    async delete(wordId: string) {
        const { error } = await supabase
            .from('words')
            .delete()
            .eq('id', wordId);

        if (error) throw error;
    }
};
