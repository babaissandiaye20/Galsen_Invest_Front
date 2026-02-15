/**
 * Store investissements — Zustand
 */
import { create } from 'zustand';
import type { Investment, PaginatedData, PaginationParams, CreateInvestmentRequest } from '../models';
import { investmentService, extractErrorMessage } from '../services';

interface InvestmentState {
    investments: Investment[];
    campaignInvestments: Investment[];
    pagination: Omit<PaginatedData<Investment>, 'content'> | null;
    loading: boolean;
    error: string | null;

    fetchByInvestor: (investorProfileId: string, params?: PaginationParams) => Promise<void>;
    fetchByCampaign: (campaignId: string, params?: PaginationParams) => Promise<void>;
    invest: (data: CreateInvestmentRequest) => Promise<Investment>;
    cancel: (id: string, reason?: string) => Promise<void>;
    clearError: () => void;
}

export const useInvestmentStore = create<InvestmentState>()((set) => ({
    investments: [],
    campaignInvestments: [],
    pagination: null,
    loading: false,
    error: null,

    fetchByInvestor: async (investorProfileId, params) => {
        set({ loading: true, error: null });
        try {
            const res = await investmentService.getByInvestor(investorProfileId, params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ investments: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('❌ Erreur fetchByInvestor:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement investissements'), investments: [], loading: false });
            throw err;
        }
    },

    fetchByCampaign: async (campaignId, params) => {
        set({ loading: true, error: null });
        try {
            const res = await investmentService.getByCampaign(campaignId, params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ campaignInvestments: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('❌ Erreur fetchByCampaign:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement investissements campagne'), campaignInvestments: [], loading: false });
        }
    },

    invest: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await investmentService.create(data);
            set((state) => ({
                investments: [res.data, ...state.investments],
                campaignInvestments: [res.data, ...state.campaignInvestments],
                loading: false,
            }));
            return res.data;
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, "Erreur lors de l'investissement"), loading: false });
            throw err;
        }
    },

    cancel: async (id, reason) => {
        set({ loading: true, error: null });
        try {
            await investmentService.cancel(id, reason);
            set((state) => ({
                investments: state.investments.filter((i) => i.id !== id),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur annulation investissement'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
