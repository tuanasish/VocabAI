import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vocabularyApi } from './vocabularyApi';
import { supabase } from '../supabaseClient';

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn(),
        }))
    }
}));

describe('vocabularyApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all vocabulary sets for a user', async () => {
            const mockData = [
                { id: '1', title: 'Set 1', user_id: 'user-1', words: [{ count: 5 }] },
                { id: '2', title: 'Set 2', user_id: 'user-1', words: [{ count: 3 }] }
            ];

            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.order).mockResolvedValue({ data: mockData, error: null } as any);

            const result = await vocabularyApi.getAll('user-1');

            expect(supabase.from).toHaveBeenCalledWith('vocabulary_sets');
            expect(result).toEqual(mockData);
        });

        it('should throw error when fetch fails', async () => {
            const mockError = new Error('Database error');
            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.order).mockResolvedValue({ data: null, error: mockError } as any);

            await expect(vocabularyApi.getAll('user-1')).rejects.toThrow('Database error');
        });
    });

    describe('getById', () => {
        it('should fetch a vocabulary set by ID', async () => {
            const mockData = { id: '1', title: 'Set 1', user_id: 'user-1' };
            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.single).mockResolvedValue({ data: mockData, error: null } as any);

            const result = await vocabularyApi.getById('1');

            expect(supabase.from).toHaveBeenCalledWith('vocabulary_sets');
            expect(result).toEqual(mockData);
        });
    });

    describe('create', () => {
        it('should create a new vocabulary set', async () => {
            const newSet = {
                title: 'New Set',
                description: 'Test set',
                user_id: 'user-1',
                category: 'general' as const,
                level: 'beginner' as const
            };

            const mockData = { ...newSet, id: '123', created_at: new Date().toISOString() };
            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.single).mockResolvedValue({ data: mockData, error: null } as any);

            const result = await vocabularyApi.create(newSet);

            expect(supabase.from).toHaveBeenCalledWith('vocabulary_sets');
            expect(result).toEqual(mockData);
        });
    });

    describe('update', () => {
        it('should update a vocabulary set', async () => {
            const updates = { title: 'Updated Title' };
            const mockData = { id: '1', title: 'Updated Title', user_id: 'user-1' };

            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.single).mockResolvedValue({ data: mockData, error: null } as any);

            const result = await vocabularyApi.update('1', 'user-1', updates);

            expect(supabase.from).toHaveBeenCalledWith('vocabulary_sets');
            expect(result).toEqual(mockData);
        });

        it('should throw error when update fails', async () => {
            const mockError = new Error('Update failed');
            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.single).mockResolvedValue({ data: null, error: mockError } as any);

            await expect(vocabularyApi.update('1', 'user-1', { title: 'Test' }))
                .rejects.toThrow('Update failed');
        });
    });

    describe('delete', () => {
        it('should delete a vocabulary set', async () => {
            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.eq).mockResolvedValue({ data: null, error: null } as any);

            await vocabularyApi.delete('1', 'user-1');

            expect(supabase.from).toHaveBeenCalledWith('vocabulary_sets');
        });

        it('should throw error when delete fails', async () => {
            const mockError = new Error('Delete failed');
            const mockChain = supabase.from('vocabulary_sets');
            vi.mocked(mockChain.eq).mockResolvedValue({ data: null, error: mockError } as any);

            await expect(vocabularyApi.delete('1', 'user-1')).rejects.toThrow('Delete failed');
        });
    });
});
