import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { vocabularyApi } from '../api/vocabularyApi';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../types/supabase';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'] & {
    words: { count: number }[];
};

/**
 * Custom hook để quản lý vocabulary sets
 * Tự động fetch khi component mount và cung cấp các methods CRUD
 */
export function useVocabularySets() {
    const { user } = useAuth();
    const [sets, setSets] = useState<VocabularySet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch tất cả vocabulary sets
     */
    const fetchSets = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const data = await vocabularyApi.getAll(user.id);
            setSets(data as VocabularySet[]);
        } catch (err: any) {
            console.error('Error fetching sets:', err);
            const errorMessage = err.message || 'Không thể tải danh sách vocabulary sets';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Xóa một vocabulary set
     */
    const deleteSet = async (setId: string) => {
        if (!user) return;

        try {
            await vocabularyApi.delete(setId, user.id);
            await fetchSets();
            toast.success('Vocabulary set deleted successfully!');
        } catch (err: any) {
            console.error('Error deleting set:', err);
            const errorMessage = err.message || 'Không thể xóa vocabulary set';
            toast.error(errorMessage);
            throw err;
        }
    };

    /**
     * Cập nhật một vocabulary set
     */
    const updateSet = async (setId: string, updates: any) => {
        if (!user) return;

        try {
            await vocabularyApi.update(setId, user.id, updates);
            await fetchSets();
            toast.success('Vocabulary set updated successfully!');
        } catch (err: any) {
            console.error('Error updating set:', err);
            const errorMessage = err.message || 'Không thể cập nhật vocabulary set';
            toast.error(errorMessage);
            throw err;
        }
    };

    // Auto-fetch khi user thay đổi
    useEffect(() => {
        fetchSets();
    }, [fetchSets]);

    return {
        sets,
        loading,
        error,
        fetchSets,
        deleteSet,
        updateSet
    };
}
