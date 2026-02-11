/**
 * Store KYC Documents — Zustand
 */
import { create } from 'zustand';
import type {
    KycDocument,
    KycDocumentType,
    KycStatus,
    PaginatedData,
    PaginationParams,
} from '../models';
import { kycService, extractErrorMessage } from '../services';

interface KycState {
    documents: KycDocument[];
    pendingDocuments: KycDocument[];
    pagination: Omit<PaginatedData<KycDocument>, 'content'> | null;
    loading: boolean;
    error: string | null;

    fetchMyDocuments: (params?: { status?: KycStatus; type?: KycDocumentType } & PaginationParams) => Promise<void>;
    uploadDocument: (userId: string, documentType: KycDocumentType, file: File) => Promise<void>;
    deleteDocument: (documentId: string) => Promise<void>;
    adminFetchPending: (params?: PaginationParams) => Promise<void>;
    adminApprove: (documentId: string) => Promise<void>;
    adminReject: (documentId: string, reason: string) => Promise<void>;
    clearError: () => void;
}

export const useKycStore = create<KycState>()((set) => ({
    documents: [],
    pendingDocuments: [],
    pagination: null,
    loading: false,
    error: null,

    fetchMyDocuments: async (params) => {
        set({ loading: true, error: null });
        try {
            const res = await kycService.getMyDocuments(params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ documents: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement documents KYC'), loading: false });
        }
    },

    uploadDocument: async (userId, documentType, file) => {
        set({ loading: true, error: null });
        try {
            const res = await kycService.upload(userId, documentType, file);
            set((state) => ({
                documents: [res.data, ...state.documents],
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur upload document'), loading: false });
        }
    },

    deleteDocument: async (documentId) => {
        set({ loading: true, error: null });
        try {
            await kycService.delete(documentId);
            set((state) => ({
                documents: state.documents.filter((d) => d.id !== documentId),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur suppression document'), loading: false });
        }
    },

    adminFetchPending: async (params) => {
        set({ loading: true, error: null });
        try {
            const res = await kycService.getPending(params);
            const { content = [], ...pagination } = res.data ?? {};
            set({ pendingDocuments: content, pagination, loading: false });
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur chargement documents en attente'), loading: false });
        }
    },

    adminApprove: async (documentId) => {
        set({ loading: true, error: null });
        try {
            await kycService.approve(documentId);
            set((state) => ({
                pendingDocuments: state.pendingDocuments.filter((d) => d.id !== documentId),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur approbation document'), loading: false });
        }
    },

    adminReject: async (documentId, reason) => {
        set({ loading: true, error: null });
        try {
            await kycService.reject(documentId, reason);
            set((state) => ({
                pendingDocuments: state.pendingDocuments.filter((d) => d.id !== documentId),
                loading: false,
            }));
        } catch (err: unknown) {
            set({ error: extractErrorMessage(err, 'Erreur rejet document'), loading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
