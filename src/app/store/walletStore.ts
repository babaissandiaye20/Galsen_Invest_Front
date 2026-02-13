/**
 * Store wallet — Zustand
 */
import { create } from 'zustand';
import type { Wallet, Transaction, PaginatedData, PaginationParams, DepositRequest, DepositSession } from '../models';
import { walletService, extractErrorMessage } from '../services';

interface WalletState {
    wallet: Wallet | null;
    transactions: Transaction[];
    pagination: Omit<PaginatedData<Transaction>, 'content'> | null;
    loading: boolean;
    error: string | null;

    fetchWallet: () => Promise<void>;
    fetchTransactions: (params?: PaginationParams) => Promise<void>;
    deposit: (data: DepositRequest) => Promise<DepositSession>;
    clearError: () => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
    wallet: null,
    transactions: [],
    pagination: null,
    loading: false,
    error: null,

    fetchWallet: async () => {
        set({ loading: true, error: null });
        try {
            const res = await walletService.getMyWallet();
            set({ wallet: res.data, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement wallet'), loading: false });
        }
    },

    fetchTransactions: async (params) => {
        set({ loading: true, error: null });
        try {
            const res = await walletService.getMyTransactions(params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ transactions: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement transactions'), loading: false });
        }
    },

    deposit: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await walletService.deposit(data);
            set({ loading: false });
            return res.data;
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur dépôt'), loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
