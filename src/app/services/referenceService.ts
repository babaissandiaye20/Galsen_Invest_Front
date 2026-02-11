/**
 * Service Données de référence — 7 endpoints
 */
import { apiGet } from './httpClient';
import type { ApiResponse, Pays, Sector } from '../models';

export const referenceService = {
    // 1.24 Liste des pays
    getCountries: () =>
        apiGet<ApiResponse<Pays[]>>('/auth-service/api/pays'),

    // 1.25 Pays par ID
    getCountryById: (id: string) =>
        apiGet<ApiResponse<Pays>>(`/auth-service/api/pays/${id}`),

    // 1.26 Pays par code ISO
    getCountryByCode: (codeIso: string) =>
        apiGet<ApiResponse<Pays>>(`/auth-service/api/pays/code/${codeIso}`),

    // 1.27 Liste des secteurs
    getSectors: () =>
        apiGet<ApiResponse<Sector[]>>('/auth-service/api/sectors'),

    // 1.28 Secteur par ID
    getSectorById: (id: string) =>
        apiGet<ApiResponse<Sector>>(`/auth-service/api/sectors/${id}`),

    // 1.29 Types de documents
    getDocumentTypes: () =>
        apiGet<ApiResponse<string[]>>('/auth-service/api/type-documents'),

    // 1.30 Types d'entreprises
    getBusinessTypes: () =>
        apiGet<ApiResponse<string[]>>('/auth-service/api/type-entreprises'),
};
