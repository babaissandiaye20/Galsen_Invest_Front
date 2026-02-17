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
    getByCampaign: (campaignId: string, params?: PaginationParams) => {
        const parts: string[] = [];
        if (params?.page != null) parts.push(`page=${params.page}`);
        if (params?.size != null) parts.push(`size=${params.size}`);
        if (params?.sort) parts.push(`sort=${params.sort}`);
        const qs = parts.length ? `?${parts.join('&')}` : '';
        return apiGet<ApiResponse<PaginatedData<Investment>>>(
            `/investment-service/api/investments/campaign/${campaignId}${qs}`,
        );
    },

    // 3.3bis Nombre d'investissements d'une campagne (léger : size=1)
    getCountByCampaign: (campaignId: string) =>
        apiGet<ApiResponse<PaginatedData<Investment>>>(
            `/investment-service/api/investments/campaign/${campaignId}?page=0&size=1&sort=createdAt,DESC`,
        ).then(res => res.data?.totalElements ?? 0),

    // 3.4 Total investi dans une campagne
    getCampaignTotal: (campaignId: string) =>
        apiGet<ApiResponse<number>>(`/investment-service/api/investments/campaign/${campaignId}/total`),

    // 3.5 Annuler un investissement
    cancel: (investmentId: string, reason?: string) => {
        const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        return apiDelete<ApiResponse<null>>(`/investment-service/api/investments/${investmentId}${query}`);
    },
};
