import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { wordsApi } from '../api';
import { Database } from '../../types/supabase';

type Word = Database['public']['Tables']['words']['Row'];

/**
 * Custom hook để quản lý words trong một vocabulary set
 */
export function useWords(setId: string | undefined) {
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch tất cả words trong set
     */
    const fetchWords = useCallback(async () => {
        if (!setId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await wordsApi.getBySetId(setId);
            setWords(data);
        } catch (err: any) {
            console.error('Error fetching words:', err);
            const errorMessage = err.message || 'Không thể tải danh sách từ vựng';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [setId]);

    /**
     * Xóa một word
     */
    const deleteWord = async (wordId: string) => {
        try {
            await wordsApi.delete(wordId);
            await fetchWords();
            toast.success('Word deleted successfully!');
        } catch (err: any) {
            console.error('Error deleting word:', err);
            const errorMessage = err.message || 'Không thể xóa từ vựng';
            toast.error(errorMessage);
            throw err;
        }
    };

    /**
     * Cập nhật một word
     */
    const updateWord = async (wordId: string, updates: any) => {
        try {
            await wordsApi.update(wordId, updates);
            await fetchWords();
            toast.success('Word updated successfully!');
        } catch (err: any) {
            console.error('Error updating word:', err);
            const errorMessage = err.message || 'Không thể cập nhật từ vựng';
            toast.error(errorMessage);
            throw err;
        }
    };

    // Auto-fetch khi setId thay đổi
    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    return {
        words,
        loading,
        error,
        fetchWords,
        deleteWord,
        updateWord
    };
}
