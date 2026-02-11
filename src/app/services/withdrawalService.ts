/**
 * Service Retraits (Withdrawals) — 8 endpoints
 */
import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';
import type {
    ApiResponse,
    PaginatedData,
    PaginationParams,
    Withdrawal,
    WithdrawalStatus,
    CreateWithdrawalRequest,
    RejectWithdrawalRequest,
} from '../models';

export const withdrawalService = {
    // 3.13 Créer une demande de retrait
    create: (data: CreateWithdrawalRequest, businessProfileId: string) =>
        apiPost<ApiResponse<Withdrawal>>('/investment-service/api/withdrawals', data, {
            headers: { 'X-Business-Profile-Id': businessProfileId },
        }),

    // 3.14 Mes demandes de retrait
    getMyWithdrawals: (params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Withdrawal>>>('/investment-service/api/withdrawals/my-withdrawals', { params }),

    // 3.15 Détail d'une demande
    getById: (withdrawalId: string) =>
        apiGet<ApiResponse<Withdrawal>>(`/investment-service/api/withdrawals/${withdrawalId}`),

    // 3.16 Annuler une demande
    cancel: (withdrawalId: string, businessProfileId: string) =>
        apiDelete<ApiResponse<null>>(`/investment-service/api/withdrawals/${withdrawalId}`, {
            headers: { 'X-Business-Profile-Id': businessProfileId },
        }),

    // 3.17 Demandes en attente (Admin)
    getPending: (params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Withdrawal>>>('/investment-service/api/withdrawals/pending', { params }),

    // 3.18 Demandes par statut (Admin)
    getByStatus: (status: WithdrawalStatus, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Withdrawal>>>(
            `/investment-service/api/withdrawals/status/${status}`,
            { params },
        ),

    // 3.19 Approuver un retrait (Admin)
    approve: (withdrawalId: string, adminId: string) =>
        apiPut<ApiResponse<Withdrawal>>(`/investment-service/api/withdrawals/${withdrawalId}/approve`, undefined, {
            headers: { 'X-Admin-Id': adminId },
        }),

    // 3.20 Rejeter un retrait (Admin)
    reject: (withdrawalId: string, data: RejectWithdrawalRequest, adminId: string) =>
        apiPut<ApiResponse<Withdrawal>>(`/investment-service/api/withdrawals/${withdrawalId}/reject`, data, {
            headers: { 'X-Admin-Id': adminId },
        }),
};
