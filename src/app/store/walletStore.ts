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

    // Admin
    adminTransactions: Transaction[];
    adminTransactionsPagination: Omit<PaginatedData<Transaction>, 'content'> | null;
    adminLoading: boolean;

    fetchWallet: () => Promise<void>;
    fetchTransactions: (params?: PaginationParams) => Promise<void>;
    deposit: (data: DepositRequest) => Promise<DepositSession>;
    adminFetchTransactions: (params?: PaginationParams & { type?: string; status?: string }) => Promise<void>;
    clearError: () => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
    wallet: null,
    transactions: [],
    pagination: null,
    loading: false,
    error: null,

    // Admin
    adminTransactions: [],
    adminTransactionsPagination: null,
    adminLoading: false,

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
            console.log('📦 [walletStore] Transactions brutes du backend:', JSON.stringify(res.data, null, 2));
            const { content = [], ...pagination } = res.data ?? {};
            if (content.length > 0) {
                console.log('📦 [walletStore] Exemple transaction[0]:', JSON.stringify(content[0], null, 2));
                console.log('📦 [walletStore] Clés transaction[0]:', Object.keys(content[0]));
            }
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

    adminFetchTransactions: async (params) => {
        set({ adminLoading: true, error: null });
        try {
            const res = await walletService.getAdminTransactions(params);
            console.log('📦 [walletStore] Admin transactions brutes:', JSON.stringify(res.data, null, 2));
            const { content = [], ...pagination } = res.data ?? {};
            if (content.length > 0) {
                console.log('📦 [walletStore] Admin transaction[0]:', JSON.stringify(content[0], null, 2));
                console.log('📦 [walletStore] Admin clés transaction[0]:', Object.keys(content[0]));
            }
            set({ adminTransactions: content, adminTransactionsPagination: pagination, adminLoading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement transactions admin'), adminLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
