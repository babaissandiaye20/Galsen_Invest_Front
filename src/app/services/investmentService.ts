/**
 * Service Investissements — 5 endpoints
 */
import { apiGet, apiPost, apiDelete } from './httpClient';
import type {
    ApiResponse,
    PaginatedData,
    PaginationParams,
    Investment,
    CreateInvestmentRequest,
} from '../models';

export const investmentService = {
    // 3.1 Créer un investissement
    create: (data: CreateInvestmentRequest) =>
        apiPost<ApiResponse<Investment>>('/investment-service/api/investments', data),

    // 3.2 Mes investissements (par investorProfileId)
    getByInvestor: (investorProfileId: string, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Investment>>>(
            `/investment-service/api/investments/investor/${investorProfileId}`,
            { params },
        ),

    // 3.3 Investissements d'une campagne
    getByCampaign: (campaignId: string, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Investment>>>(
            `/investment-service/api/investments/campaign/${campaignId}`,
            { params },
        ),

    // 3.4 Total investi dans une campagne
    getCampaignTotal: (campaignId: string) =>
        apiGet<ApiResponse<number>>(`/investment-service/api/investments/campaign/${campaignId}/total`),

    // 3.5 Annuler un investissement
    cancel: (investmentId: string, reason?: string) => {
        const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        return apiDelete<ApiResponse<null>>(`/investment-service/api/investments/${investmentId}${query}`);
    },
};
