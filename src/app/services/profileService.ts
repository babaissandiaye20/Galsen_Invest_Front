/**
 * Service Profils (Investor & Business) — 4 endpoints
 */
import { apiGet, apiPut } from './httpClient';
import type {
    ApiResponse,
    InvestorProfile,
    UpdateInvestorProfileRequest,
    BusinessProfile,
    UpdateBusinessProfileRequest,
} from '../models';

export const profileService = {
    // 1.11 Mon profil Investor
    getInvestorProfile: () =>
        apiGet<ApiResponse<InvestorProfile>>('/auth-service/api/auth/profile/investor/me'),

    // 1.12 Mon profil Business
    getBusinessProfile: () =>
        apiGet<ApiResponse<BusinessProfile>>('/auth-service/api/auth/profile/business/me'),

    // 1.13 Modifier profil Investor
    updateInvestorProfile: (data: UpdateInvestorProfileRequest) =>
        apiPut<ApiResponse<InvestorProfile>>('/auth-service/api/auth/profile/investor/me', data),

    // 1.14 Modifier profil Business
    updateBusinessProfile: (data: UpdateBusinessProfileRequest) =>
        apiPut<ApiResponse<BusinessProfile>>('/auth-service/api/auth/profile/business/me', data),
};
