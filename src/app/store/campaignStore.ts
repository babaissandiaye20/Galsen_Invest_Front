/**
 * Store campagnes — Zustand
 */
import { create } from 'zustand';
import type { Campaign, PaginatedData, PaginationParams, CreateCampaignRequest, RejectCampaignRequest } from '../models';
import { campaignService, extractErrorMessage } from '../services';

interface CampaignState {
    campaigns: Campaign[];
    myCampaigns: Campaign[];
    pendingCampaigns: Campaign[];
    currentCampaign: Campaign | null;
    pagination: Omit<PaginatedData<Campaign>, 'content'> | null;
    loading: boolean;
    error: string | null;

    fetchAll: (params?: PaginationParams) => Promise<void>;
    fetchApproved: (params?: PaginationParams) => Promise<void>;
    fetchById: (id: string) => Promise<void>;
    search: (keyword: string, params?: PaginationParams) => Promise<void>;
    fetchByCategory: (categoryId: string, params?: PaginationParams) => Promise<void>;
    fetchMyCampaigns: (params?: PaginationParams) => Promise<void>;
    fetchPendingReview: (params?: PaginationParams) => Promise<void>;
    create: (data: CreateCampaignRequest) => Promise<Campaign>;
    submit: (id: string) => Promise<void>;
    adminApprove: (id: string) => Promise<void>;
    adminReject: (id: string, data: RejectCampaignRequest) => Promise<void>;
    clearError: () => void;
}

export const useCampaignStore = create<CampaignState>()((set) => ({
    campaigns: [],
    myCampaigns: [],
    pendingCampaigns: [],
    currentCampaign: null,
    pagination: null,
    loading: false,
    error: null,

    fetchAll: async (params) => {
        console.log('🔄 [campaignStore] fetchAll avec params:', params);
        set({ loading: true, error: null });
        try {
            // L'API retourne directement PaginatedData, pas { data: PaginatedData }
            const paginatedData = await campaignService.getAll(params);
            console.log('✅ [campaignStore] Réponse getAll:', paginatedData);
            const { content = [], ...pagination } = paginatedData ?? {};
            console.log('📦 [campaignStore] content:', content);
            set({ campaigns: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('❌ [campaignStore] Erreur fetchAll:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement campagnes'), loading: false });
        }
    },

    fetchApproved: async (params) => {
        set({ loading: true, error: null });
        try {
            // L'API retourne directement PaginatedData, pas { data: PaginatedData }
            const paginatedData = await campaignService.getApproved(params);
            console.log('✅ [campaignStore] Campagnes approuvées:', paginatedData);
            const { content = [], ...pagination } = paginatedData ?? {};
            set({ campaigns: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('❌ Erreur fetchApproved:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement campagnes'), campaigns: [], loading: false });
            throw err;
        }
    },

    fetchById: async (id) => {
        console.log('🔄 [campaignStore] fetchById:', id);
        set({ loading: true, error: null });
        try {
            const res = await campaignService.getById(id);
            console.log('✅ [campaignStore] Réponse getById:', res);
            console.log('📦 [campaignStore] res.data:', res.data);
            // Vérifier si l'API retourne directement la campagne ou { data: campaign }
            const campaign = res.data ?? res;
            console.log('📦 [campaignStore] campaign:', campaign);
            set({ currentCampaign: campaign, loading: false });
        } catch (err: unknown) {
            console.error('❌ [campaignStore] Erreur fetchById:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement campagne'), loading: false });
        }
    },

    search: async (keyword, params) => {
        set({ loading: true, error: null });
        try {
            const res = await campaignService.search(keyword, params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ campaigns: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur recherche campagnes'), loading: false });
        }
    },

    fetchByCategory: async (categoryId, params) => {
        set({ loading: true, error: null });
        try {
            const res = await campaignService.getByCategory(categoryId, params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ campaigns: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement campagnes par catégorie'), loading: false });
        }
    },

    fetchMyCampaigns: async (params) => {
        console.log('🔄 [campaignStore] fetchMyCampaigns avec params:', params);
        set({ loading: true, error: null });
        try {
            // L'API retourne directement PaginatedData, pas { data: PaginatedData }
            const paginatedData = await campaignService.getMyCampaigns(params);
            console.log('✅ [campaignStore] Réponse API:', paginatedData);
            const { content = [], ...pagination } = paginatedData ?? {};
            console.log('📦 [campaignStore] Campagnes extraites:', content);
            console.log('📦 [campaignStore] Pagination:', pagination);
            set({ myCampaigns: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('❌ [campaignStore] Erreur:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement mes campagnes'), loading: false });
        }
    },

    fetchPendingReview: async (params) => {
        set({ loading: true, error: null });
        try {
            const res = await campaignService.getByStatus('REVIEW', params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ pendingCampaigns: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement campagnes en révision'), loading: false });
        }
    },

    create: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await campaignService.create(data);
            set((state) => ({
                myCampaigns: [res.data, ...state.myCampaigns],
                loading: false,
            }));
            return res.data;
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur création campagne'), loading: false });
            throw err;
        }
    },

    submit: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await campaignService.submit(id);
            set((state) => ({
                myCampaigns: state.myCampaigns.map((c) => (c.id === id ? res.data : c)),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur soumission campagne'), loading: false });
        }
    },

    adminApprove: async (id) => {
        set({ loading: true, error: null });
        try {
            await campaignService.approve(id);
            set((state) => ({
                pendingCampaigns: state.pendingCampaigns.filter((c) => c.id !== id),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur approbation campagne'), loading: false });
        }
    },

    adminReject: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await campaignService.reject(id, data);
            set((state) => ({
                pendingCampaigns: state.pendingCampaigns.filter((c) => c.id !== id),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur rejet campagne'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
