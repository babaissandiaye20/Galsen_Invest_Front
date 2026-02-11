/**
 * Store profils (Investor & Business) — Zustand
 */
import { create } from 'zustand';
import type {
    InvestorProfile,
    BusinessProfile,
    UpdateInvestorProfileRequest,
    UpdateBusinessProfileRequest,
} from '../models';
import { profileService, extractErrorMessage } from '../services';

interface ProfileState {
    investorProfile: InvestorProfile | null;
    businessProfile: BusinessProfile | null;
    loading: boolean;
    error: string | null;

    fetchInvestorProfile: () => Promise<void>;
    fetchBusinessProfile: () => Promise<void>;
    updateInvestorProfile: (data: UpdateInvestorProfileRequest) => Promise<void>;
    updateBusinessProfile: (data: UpdateBusinessProfileRequest) => Promise<void>;
    clearError: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
    investorProfile: null,
    businessProfile: null,
    loading: false,
    error: null,

    fetchInvestorProfile: async () => {
        set({ loading: true, error: null });
        try {
            const res = await profileService.getInvestorProfile();
            set({ investorProfile: res.data, loading: false });
        } catch (err: unknown) {
            console.error('❌ Erreur fetchInvestorProfile:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement profil investisseur'), loading: false });
            // Ne pas rejeter l'erreur pour éviter la redirection
        }
    },

    fetchBusinessProfile: async () => {
        set({ loading: true, error: null });
        try {
            const res = await profileService.getBusinessProfile();
            set({ businessProfile: res.data, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement profil entreprise'), loading: false });
        }
    },

    updateInvestorProfile: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await profileService.updateInvestorProfile(data);
            set({ investorProfile: res.data, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur mise à jour profil'), loading: false });
        }
    },

    updateBusinessProfile: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await profileService.updateBusinessProfile(data);
            set({ businessProfile: res.data, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur mise à jour profil'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
