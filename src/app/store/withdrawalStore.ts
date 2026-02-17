/**
 * Store retraits (withdrawals) — Zustand
 */
import { create } from 'zustand';
import type {
    Withdrawal,
    WithdrawalStatus,
    PaginatedData,
    PaginationParams,
    CreateWithdrawalRequest,
    RejectWithdrawalRequest,
} from '../models';
import { withdrawalService, extractErrorMessage } from '../services';

interface WithdrawalState {
    withdrawals: Withdrawal[];
    selectedWithdrawal: Withdrawal | null;
    pagination: Omit<PaginatedData<Withdrawal>, 'content'> | null;
    loading: boolean;
    error: string | null;

    requestWithdrawal: (data: CreateWithdrawalRequest, businessProfileId: string) => Promise<void>;
    fetchMyWithdrawals: (params?: PaginationParams, businessProfileId?: string) => Promise<void>;
    fetchById: (withdrawalId: string) => Promise<void>;
    cancelWithdrawal: (withdrawalId: string, businessProfileId: string) => Promise<void>;
    adminFetchPending: (params?: PaginationParams) => Promise<void>;
    adminFetchByStatus: (status: WithdrawalStatus, params?: PaginationParams) => Promise<void>;
    adminApprove: (withdrawalId: string, adminId: string) => Promise<void>;
    adminReject: (withdrawalId: string, data: RejectWithdrawalRequest, adminId: string) => Promise<void>;
    clearError: () => void;
}

export const useWithdrawalStore = create<WithdrawalState>()((set) => ({
    withdrawals: [],
    selectedWithdrawal: null,
    pagination: null,
    loading: false,
    error: null,

    requestWithdrawal: async (data, businessProfileId) => {
        console.log('[WithdrawalStore] requestWithdrawal called with data:', data, 'profileId:', businessProfileId);
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.create(data, businessProfileId);
            console.log('[WithdrawalStore] requestWithdrawal SUCCESS - res:', res);
            console.log('[WithdrawalStore] requestWithdrawal - res.data:', res.data);
            set((state) => ({
                withdrawals: [res.data, ...state.withdrawals],
                loading: false,
            }));
        } catch (err: unknown) {
            const fetchErr = err as any;
            console.error('[WithdrawalStore] requestWithdrawal ERROR:', err);
            console.error('[WithdrawalStore] requestWithdrawal ERROR BODY (err.data):', fetchErr?.data);
            console.error('[WithdrawalStore] requestWithdrawal ERROR status:', fetchErr?.status, 'statusText:', fetchErr?.statusText);
            set({ error: extractErrorMessage(err, 'Erreur demande de retrait'), loading: false });
        }
    },

    fetchMyWithdrawals: async (params, businessProfileId) => {
        console.log('[WithdrawalStore] fetchMyWithdrawals called with params:', params, 'profileId:', businessProfileId);
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.getMyWithdrawals(params, businessProfileId);
            console.log('[WithdrawalStore] fetchMyWithdrawals - full res:', res);
            console.log('[WithdrawalStore] fetchMyWithdrawals - res.data:', res.data);
            console.log('[WithdrawalStore] fetchMyWithdrawals - typeof res.data:', typeof res.data);
            const { content = [], ...pagination } = res.data ?? {};
            console.log('[WithdrawalStore] fetchMyWithdrawals - content:', content, 'length:', content.length);
            set({ withdrawals: content, pagination, loading: false });
        } catch (err: unknown) {
            const fetchErr = err as any;
            console.error('[WithdrawalStore] fetchMyWithdrawals ERROR:', err);
            console.error('[WithdrawalStore] fetchMyWithdrawals ERROR BODY (err.data):', fetchErr?.data);
            console.error('[WithdrawalStore] fetchMyWithdrawals ERROR status:', fetchErr?.status, 'statusText:', fetchErr?.statusText);
            set({ error: extractErrorMessage(err, 'Erreur chargement retraits'), loading: false });
        }
    },

    fetchById: async (withdrawalId) => {
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.getById(withdrawalId);
            set({ selectedWithdrawal: res.data, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement détail retrait'), loading: false });
        }
    },

    cancelWithdrawal: async (withdrawalId, businessProfileId) => {
        set({ loading: true, error: null });
        try {
            await withdrawalService.cancel(withdrawalId, businessProfileId);
            set((state) => ({
                withdrawals: state.withdrawals.filter((w) => w.id !== withdrawalId),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur annulation retrait'), loading: false });
        }
    },

    adminFetchPending: async (params) => {
        console.log('[WithdrawalStore] adminFetchPending called with params:', params);
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.getPending(params);
            console.log('[WithdrawalStore] adminFetchPending - full res:', res);
            console.log('[WithdrawalStore] adminFetchPending - res.data:', res.data);
            console.log('[WithdrawalStore] adminFetchPending - typeof res.data:', typeof res.data);
            const pageData = res.data ?? {};
            console.log('[WithdrawalStore] adminFetchPending - pageData:', pageData);
            console.log('[WithdrawalStore] adminFetchPending - pageData.content:', (pageData as any).content);
            const { content = [], ...pagination } = pageData as any;
            console.log('[WithdrawalStore] adminFetchPending - extracted content:', content, 'length:', content.length);
            console.log('[WithdrawalStore] adminFetchPending - extracted pagination:', pagination);
            set({ withdrawals: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('[WithdrawalStore] adminFetchPending ERROR:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement retraits en attente'), loading: false });
        }
    },

    adminFetchByStatus: async (status, params) => {
        console.log('[WithdrawalStore] adminFetchByStatus called with status:', status, 'params:', params);
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.getByStatus(status, params);
            console.log('[WithdrawalStore] adminFetchByStatus - full res:', res);
            console.log('[WithdrawalStore] adminFetchByStatus - res.data:', res.data);
            const pageData = res.data ?? {};
            console.log('[WithdrawalStore] adminFetchByStatus - pageData:', pageData);
            console.log('[WithdrawalStore] adminFetchByStatus - pageData.content:', (pageData as any).content);
            const { content = [], ...pagination } = pageData as any;
            console.log('[WithdrawalStore] adminFetchByStatus - extracted content:', content, 'length:', content.length);
            set({ withdrawals: content, pagination, loading: false });
        } catch (err: unknown) {
            console.error('[WithdrawalStore] adminFetchByStatus ERROR:', err);
            set({ error: extractErrorMessage(err, 'Erreur chargement retraits par statut'), loading: false });
        }
    },

    adminApprove: async (withdrawalId, adminId) => {
        set({ loading: true, error: null });
        try {
            await withdrawalService.approve(withdrawalId, adminId);
            set((state) => ({
                withdrawals: state.withdrawals.filter((w) => w.id !== withdrawalId),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur approbation retrait'), loading: false });
        }
    },

    adminReject: async (withdrawalId, data, adminId) => {
        set({ loading: true, error: null });
        try {
            await withdrawalService.reject(withdrawalId, data, adminId);
            set((state) => ({
                withdrawals: state.withdrawals.filter((w) => w.id !== withdrawalId),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur rejet retrait'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
