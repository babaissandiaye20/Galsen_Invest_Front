/**
 * Store données de référence — Zustand
 */
import { create } from 'zustand';
import type { Pays, Sector } from '../models';
import { referenceService, extractErrorMessage } from '../services';

interface ReferenceState {
    countries: Pays[];
    sectors: Sector[];
    documentTypes: string[];
    businessTypes: string[];
    loading: boolean;
    error: string | null;

    fetchCountries: () => Promise<void>;
    fetchSectors: () => Promise<void>;
    fetchDocumentTypes: () => Promise<void>;
    fetchBusinessTypes: () => Promise<void>;
    clearError: () => void;
}

export const useReferenceStore = create<ReferenceState>()((set) => ({
    countries: [],
    sectors: [],
    documentTypes: [],
    businessTypes: [],
    loading: false,
    error: null,

    fetchCountries: async () => {
        set({ loading: true, error: null });
        try {
            const res = await referenceService.getCountries();
            set({ countries: res.data ?? [], loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement pays'), loading: false });
        }
    },

    fetchSectors: async () => {
        set({ loading: true, error: null });
        try {
            const res = await referenceService.getSectors();
            set({ sectors: res.data ?? [], loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement secteurs'), loading: false });
        }
    },

    fetchDocumentTypes: async () => {
        set({ loading: true, error: null });
        try {
            const res = await referenceService.getDocumentTypes();
            set({ documentTypes: res.data ?? [], loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement types documents'), loading: false });
        }
    },

    fetchBusinessTypes: async () => {
        set({ loading: true, error: null });
        try {
            const res = await referenceService.getBusinessTypes();
            set({ businessTypes: res.data ?? [], loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement types entreprises'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
