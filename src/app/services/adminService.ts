/**
 * Service admin — gestion des utilisateurs
 */
import { apiGet, apiPatch } from './httpClient';
import type { ApiResponse, PaginatedData, PaginationParams } from '../models';
import type { AdminUser, UpdateUserStatusRequest, CampaignStats, InvestmentStats } from '../models/admin.model';

export const adminService = {
  /** Liste des utilisateurs (hors admins) */
  getUsers: (params?: PaginationParams) =>
    apiGet<ApiResponse<PaginatedData<AdminUser>>>('/auth-service/api/admin/users', {
      params: { page: params?.page ?? 0, size: params?.size ?? 15 },
    }),

  /** Activer / Suspendre un utilisateur */
  updateUserStatus: (userId: string, data: UpdateUserStatusRequest) =>
    apiPatch<ApiResponse<null>>(`/auth-service/api/admin/users/${userId}/status`, data),

  /** Statistiques des campagnes */
  getCampaignStats: () =>
    apiGet<ApiResponse<CampaignStats>>('/campaign-service/api/v1/statistics/admin/campaigns'),

  /** Statistiques des investissements */
  getInvestmentStats: () =>
    apiGet<ApiResponse<InvestmentStats>>('/investment-service/api/statistics/admin/investments'),
};
