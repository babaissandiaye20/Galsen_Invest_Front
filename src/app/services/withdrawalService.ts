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
    getMyWithdrawals: async (params?: PaginationParams, businessProfileId?: string) => {
        console.log('[WithdrawalService] getMyWithdrawals called with params:', params, 'profileId:', businessProfileId);
        try {
            const res = await apiGet<ApiResponse<PaginatedData<Withdrawal>>>('/investment-service/api/withdrawals/my-withdrawals', {
                params,
                headers: businessProfileId ? { 'X-Business-Profile-Id': businessProfileId } : undefined,
            });
            console.log('[WithdrawalService] getMyWithdrawals raw response:', JSON.stringify(res, null, 2));
            return res;
        } catch (err) {
            console.error('[WithdrawalService] getMyWithdrawals ERROR:', err);
            throw err;
        }
    },

    // 3.15 Détail d'une demande
    getById: (withdrawalId: string) =>
        apiGet<ApiResponse<Withdrawal>>(`/investment-service/api/withdrawals/${withdrawalId}`),

    // 3.16 Annuler une demande
    cancel: (withdrawalId: string, businessProfileId: string) =>
        apiDelete<ApiResponse<null>>(`/investment-service/api/withdrawals/${withdrawalId}`, {
            headers: { 'X-Business-Profile-Id': businessProfileId },
        }),

    // 3.17 Demandes en attente (Admin)
    getPending: async (params?: PaginationParams) => {
        console.log('[WithdrawalService] getPending called with params:', params);
        try {
            const res = await apiGet<ApiResponse<PaginatedData<Withdrawal>>>('/investment-service/api/withdrawals/pending', { params });
            console.log('[WithdrawalService] getPending raw response:', JSON.stringify(res, null, 2));
            return res;
        } catch (err) {
            console.error('[WithdrawalService] getPending ERROR:', err);
            throw err;
        }
    },

    // 3.18 Demandes par statut (Admin)
    getByStatus: async (status: WithdrawalStatus, params?: PaginationParams) => {
        console.log('[WithdrawalService] getByStatus called with status:', status, 'params:', params);
        try {
            const res = await apiGet<ApiResponse<PaginatedData<Withdrawal>>>(
                `/investment-service/api/withdrawals/status/${status}`,
                { params },
            );
            console.log('[WithdrawalService] getByStatus raw response:', JSON.stringify(res, null, 2));
            return res;
        } catch (err) {
            console.error('[WithdrawalService] getByStatus ERROR:', err);
            throw err;
        }
    },

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
