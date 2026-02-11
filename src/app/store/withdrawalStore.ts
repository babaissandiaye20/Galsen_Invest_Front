/**
 * Store retraits (withdrawals) — Zustand
 */
import { create } from 'zustand';
import type {
    Withdrawal,
    PaginatedData,
    PaginationParams,
    CreateWithdrawalRequest,
    RejectWithdrawalRequest,
} from '../models';
import { withdrawalService, extractErrorMessage } from '../services';

interface WithdrawalState {
    withdrawals: Withdrawal[];
    pagination: Omit<PaginatedData<Withdrawal>, 'content'> | null;
    loading: boolean;
    error: string | null;

    requestWithdrawal: (data: CreateWithdrawalRequest, businessProfileId: string) => Promise<void>;
    fetchMyWithdrawals: (params?: PaginationParams) => Promise<void>;
    cancelWithdrawal: (withdrawalId: string, businessProfileId: string) => Promise<void>;
    adminFetchPending: (params?: PaginationParams) => Promise<void>;
    adminApprove: (withdrawalId: string, adminId: string) => Promise<void>;
    adminReject: (withdrawalId: string, data: RejectWithdrawalRequest, adminId: string) => Promise<void>;
    clearError: () => void;
}

export const useWithdrawalStore = create<WithdrawalState>()((set) => ({
    withdrawals: [],
    pagination: null,
    loading: false,
    error: null,

    requestWithdrawal: async (data, businessProfileId) => {
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.create(data, businessProfileId);
            set((state) => ({
                withdrawals: [res.data, ...state.withdrawals],
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur demande de retrait'), loading: false });
        }
    },

    fetchMyWithdrawals: async (params) => {
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.getMyWithdrawals(params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ withdrawals: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement retraits'), loading: false });
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
        set({ loading: true, error: null });
        try {
            const res = await withdrawalService.getPending(params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ withdrawals: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement retraits en attente'), loading: false });
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
