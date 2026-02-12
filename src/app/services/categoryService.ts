/**
 * Service Catégories — 4 endpoints
 */
import { apiGet, apiPost, apiDelete } from './httpClient';
import type { ApiResponse, Category, CreateCategoryRequest } from '../models';

export const categoryService = {
    // 2.18 Créer une catégorie (Admin)
    create: (data: CreateCategoryRequest) =>
        apiPost<ApiResponse<Category>>('/campaign-service/api/v1/categories', data),

    // 2.19 Lister les catégories
    // Note: Cet endpoint retourne directement un tableau, pas { data: [] }
    getAll: () =>
        apiGet<Category[]>('/campaign-service/api/v1/categories'),

    // 2.20 Catégorie par ID
    getById: (id: string) =>
        apiGet<ApiResponse<Category>>(`/campaign-service/api/v1/categories/${id}`),

    // 2.21 Supprimer une catégorie (Admin)
    delete: (id: string) =>
        apiDelete<void>(`/campaign-service/api/v1/categories/${id}`),
};
