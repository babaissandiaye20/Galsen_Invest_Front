/**
 * Service KYC Documents — 9 endpoints
 */
import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';
import type {
    ApiResponse,
    PaginatedData,
    KycDocument,
    KycDocumentType,
    KycStatus,
    PaginationParams,
} from '../models';

export const kycService = {
    // 1.15 Upload document KYC (multipart/form-data)
    upload: (userId: string, documentType: KycDocumentType, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('documentType', documentType);
        return apiPost<ApiResponse<KycDocument>>(
            '/auth-service/api/v1/kyc/documents/upload',
            formData,
        );
    },

    // 1.16 Mes documents KYC
    getMyDocuments: (params?: { status?: KycStatus; type?: KycDocumentType } & PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<KycDocument>>>('/auth-service/api/v1/kyc/documents/me', {
            params,
        }),

    // 1.17 Document par ID
    getById: (documentId: string) =>
        apiGet<ApiResponse<KycDocument>>(`/auth-service/api/v1/kyc/documents/${documentId}`),

    // 1.18 Documents d'un utilisateur
    getByUser: (userId: string) =>
        apiGet<ApiResponse<KycDocument[]>>(`/auth-service/api/v1/kyc/documents/user/${userId}`),

    // 1.19 Documents d'un utilisateur (paginé)
    getByUserPaginated: (userId: string, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<KycDocument>>>(
            `/auth-service/api/v1/kyc/documents/user/${userId}/paginated`,
            { params },
        ),

    // 1.20 Documents en attente (Admin)
    getPending: (params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<KycDocument>>>('/auth-service/api/v1/kyc/documents/pending', {
            params,
        }),

    // 1.21 Approuver un document (Admin)
    approve: (documentId: string) =>
        apiPut<ApiResponse<KycDocument>>(`/auth-service/api/v1/kyc/documents/${documentId}/approve`),

    // 1.22 Rejeter un document (Admin)
    reject: (documentId: string, reason: string) =>
        apiPut<ApiResponse<KycDocument>>(
            `/auth-service/api/v1/kyc/documents/${documentId}/reject?reason=${encodeURIComponent(reason)}`,
        ),

    // 1.23 Supprimer un document
    delete: (documentId: string) =>
        apiDelete<ApiResponse<null>>(`/auth-service/api/v1/kyc/documents/${documentId}`),
};
