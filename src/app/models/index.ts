/**
 * Barrel exports — Models Galsen Invest
 */
export type { ApiResponse, PaginatedData, PaginationParams, ApiError } from './api.model';
export type {
    LoginRequest,
    RegisterRequest,
    RegisterInvestorRequest,
    RegisterBusinessRequest,
    RegisterResponse,
    AuthTokens,
    OtpChannel,
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    ForgotPasswordRequest,
} from './auth.model';
export type {
    UserInfo,
    InvestorProfile,
    UpdateInvestorProfileRequest,
    BusinessProfile,
    UpdateBusinessProfileRequest,
    KycDocumentType,
    KycStatus,
    KycDocument,
} from './user.model';
export type {
    CampaignStatus,
    Campaign,
    CreateCampaignRequest,
    UpdateCampaignRequest,
    ChangeStatusRequest,
    RejectCampaignRequest,
    CampaignPhoto,
    Category,
    CreateCategoryRequest,
} from './campaign.model';
export type { Investment, CreateInvestmentRequest } from './investment.model';
export type {
    OwnerType,
    Wallet,
    Transaction,
    DepositRequest,
    DepositSession,
    PaymentMethodCode,
    WithdrawalStatus,
    WithdrawalMethod,
    Withdrawal,
    CreateWithdrawalRequest,
    RejectWithdrawalRequest,
} from './wallet.model';
export type { Pays, Sector } from './reference.model';
