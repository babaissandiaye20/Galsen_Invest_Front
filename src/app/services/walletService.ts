/**
 * Service Wallet — 7 endpoints
 */
import { apiGet, apiPost, apiPut } from './httpClient';
import type {
    ApiResponse,
    PaginatedData,
    PaginationParams,
    Wallet,
    Transaction,
    DepositRequest,
    OwnerType,
} from '../models';

export const walletService = {
    // 3.6 Mon wallet
    getMyWallet: () =>
        apiGet<ApiResponse<Wallet>>('/investment-service/api/wallets/me'),

    // 3.7 Déposer de l'argent
    deposit: (data: DepositRequest) =>
        apiPost<ApiResponse<unknown>>('/investment-service/api/wallets/me/deposit', data),

    // 3.8 Mes transactions
    getMyTransactions: (params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Transaction>>>('/investment-service/api/wallets/me/transactions', { params }),

    // 3.9 Wallet par owner
    getWalletByOwner: (ownerType: OwnerType, ownerId: string) =>
        apiGet<ApiResponse<Wallet>>(`/investment-service/api/wallets/${ownerType}/${ownerId}`),

    // 3.10 Transactions d'un wallet
    getWalletTransactions: (walletId: string, params?: PaginationParams) =>
        apiGet<ApiResponse<PaginatedData<Transaction>>>(
            `/investment-service/api/wallets/${walletId}/transactions`,
            { params },
        ),

    // 3.11 Geler un wallet (Admin)
    freezeWallet: (walletId: string) =>
        apiPut<ApiResponse<Wallet>>(`/investment-service/api/wallets/${walletId}/freeze`),

    // 3.12 Activer un wallet (Admin)
    activateWallet: (walletId: string) =>
        apiPut<ApiResponse<Wallet>>(`/investment-service/api/wallets/${walletId}/activate`),
};
