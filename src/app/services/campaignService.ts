/**
 * Service Campagnes — 17 endpoints
 */
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './httpClient';
import type {
    ApiResponse,
    PaginatedData,
    PaginationParams,
    Campaign,
    CampaignStatus,
    UpdateCampaignRequest,
    ChangeStatusRequest,
    RejectCampaignRequest,
    CampaignPhoto,
} from '../models';

export const campaignService = {
    // 2.1 Créer une campagne (multipart/form-data)
    create: (data: {
        categoryId: string;
        title: string;
        description: string;
        targetAmount: number;
        startDate: string;
        endDate: string;
        coverImage?: File;
    }) => {
        const formData = new FormData();
        formData.append('categoryId', data.categoryId);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('targetAmount', data.targetAmount.toString());
        formData.append('startDate', data.startDate);
        formData.append('endDate', data.endDate);
        if (data.coverImage) formData.append('coverImage', data.coverImage);
        return apiPost<ApiResponse<Campaign>>('/campaign-service/api/v1/campaigns', formData);
    },

    // 2.2 Lister toutes les campagnes
    // Note: Cet endpoint retourne directement PaginatedData, pas { data: PaginatedData }
    getAll: (params?: PaginationParams) =>
        apiGet<PaginatedData<Campaign>>('/campaign-service/api/v1/campaigns', { params }),

    // 2.3 Campagne par ID
    getById: (id: string) =>
        apiGet<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}`),

    // 2.4 Campagnes approuvées
    // Note: Cet endpoint retourne directement PaginatedData, pas { data: PaginatedData }
    getApproved: (params?: PaginationParams) =>
        apiGet<PaginatedData<Campaign>>('/campaign-service/api/v1/campaigns/approved', { params }),

    // 2.5 Campagnes par catégorie
    getByCategory: (categoryId: string, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Campaign>>>(
            `/campaign-service/api/v1/campaigns/category/${categoryId}`,
            { params },
        ),

    // 2.6 Campagnes par statut
    getByStatus: (status: CampaignStatus, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Campaign>>>(
            `/campaign-service/api/v1/campaigns/status/${status}`,
            { params },
        ),

    // 2.7 Rechercher des campagnes
    search: (keyword: string, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Campaign>>>('/campaign-service/api/v1/campaigns/search', {
            params: { keyword, ...params },
        }),

    // 2.8 Mes campagnes (Business)
    // Note: Cet endpoint retourne directement PaginatedData, pas { data: PaginatedData }
    getMyCampaigns: (params?: PaginationParams) =>
        apiGet<PaginatedData<Campaign>>('/campaign-service/api/v1/campaigns/my-campaigns', { params }),

    // 2.9 Modifier une campagne
    update: (id: string, data: UpdateCampaignRequest) =>
        apiPut<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}`, data),

    // 2.10 Soumettre pour révision
    submit: (id: string) =>
        apiPost<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}/submit`),

    // Statistiques business
    getBusinessStats: () =>
        apiGet<any>('/campaign-service/api/v1/statistics/business/me'),

    // 2.11 Upload cover image
    uploadCover: (id: string, coverImage: File) => {
        const formData = new FormData();
        formData.append('coverImage', coverImage);
        return apiPost<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}/cover`, formData);
    },

    // 2.12 Upload photos
    uploadPhotos: (campaignId: string, photos: File[]) => {
        const formData = new FormData();
        photos.forEach((photo) => formData.append('photos', photo));
        return apiPost<ApiResponse<CampaignPhoto[]>>(
            `/campaign-service/api/v1/campaigns/${campaignId}/photos`,
            formData,
        );
    },

    // 2.13 Changer le statut
    changeStatus: (id: string, data: ChangeStatusRequest) =>
        apiPatch<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}/status`, data),

    // 2.14 Approuver (Admin)
    approve: (id: string) =>
        apiPut<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}/approve`),

    // 2.15 Rejeter (Admin)
    reject: (id: string, data: RejectCampaignRequest) =>
        apiPut<ApiResponse<Campaign>>(`/campaign-service/api/v1/campaigns/${id}/reject`, data),

    // 2.16 Supprimer
    delete: (id: string) =>
        apiDelete<void>(`/campaign-service/api/v1/campaigns/${id}`),

    // 2.17 Supprimer une photo
    deletePhoto: (campaignId: string, photoId: string) =>
        apiDelete<void>(`/campaign-service/api/v1/campaigns/${campaignId}/photos/${photoId}`),
};
