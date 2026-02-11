/**
 * Store catégories — Zustand
 */
import { create } from 'zustand';
import type { Category } from '../models';
import { categoryService, extractErrorMessage } from '../services';

interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;

    fetchAll: () => Promise<void>;
    clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()((set) => ({
    categories: [],
    loading: false,
    error: null,

    fetchAll: async () => {
        set({ loading: true, error: null });
        try {
            const res = await categoryService.getAll();
            set({ categories: res.data ?? [], loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement catégories'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
