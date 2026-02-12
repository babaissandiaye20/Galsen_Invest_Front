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
        console.log('🔄 [categoryStore] Début fetchAll');
        set({ loading: true, error: null });
        try {
            // L'API retourne directement un tableau, pas { data: [] }
            const categories = await categoryService.getAll();
            console.log('✅ [categoryStore] Réponse API:', categories);
            console.log('📦 [categoryStore] Catégories reçues:', categories);
            set({ categories: categories ?? [], loading: false });
        } catch (err: unknown) {
            console.error('❌ [categoryStore] Erreur:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement catégories'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
