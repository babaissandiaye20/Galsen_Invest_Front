/**
 * Service d'authentification & OTP — 10 endpoints
 */
import { apiPost, apiGet } from './httpClient';
import { tokenManager } from '../config/tokenManager';
import type {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    RegisterInvestorRequest,
    RegisterBusinessRequest,
    RegisterResponse,
    AuthTokens,
    OtpSendRequest,
    OtpSendResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    ForgotPasswordRequest,
} from '../models';

export const authService = {
    // 1.1 Login
    login: (data: LoginRequest) =>
        apiPost<ApiResponse<AuthTokens>>('/auth-service/api/auth/login', data),

    // 1.2 Refresh Token
    refreshToken: (refreshToken: string) =>
        apiPost<ApiResponse<AuthTokens>>(`/auth-service/api/auth/refresh?refreshToken=${refreshToken}`),

    // 1.3 Register générique
    register: (data: RegisterRequest) =>
        apiPost<ApiResponse<RegisterResponse>>('/auth-service/api/auth/register', data),

    // 1.4 Register Investor
    registerInvestor: (data: RegisterInvestorRequest) =>
        apiPost<ApiResponse<RegisterResponse>>('/auth-service/api/auth/register/investor', data),

    // 1.5 Register Business
    registerBusiness: (data: RegisterBusinessRequest) =>
        apiPost<ApiResponse<RegisterResponse>>('/auth-service/api/auth/register/business', data),

    // 1.6 Forgot Password
    forgotPassword: (data: ForgotPasswordRequest) =>
        apiPost<ApiResponse<null>>('/auth-service/api/auth/forgot-password', data),

    // 1.7 Logout
    logout: () => {
        tokenManager.remove();
        return apiPost<ApiResponse<null>>('/auth-service/api/auth/logout');
    },

    // 1.8 Envoyer OTP
    sendOtp: (data: OtpSendRequest) =>
        apiPost<OtpSendResponse>('/auth-service/api/otp/send', data),

    // 1.9 Vérifier OTP
    verifyOtp: (data: OtpVerifyRequest) =>
        apiPost<OtpVerifyResponse>('/auth-service/api/otp/verify', data),

    // 1.10 Renvoyer OTP
    resendOtp: (data: OtpSendRequest) =>
        apiPost<OtpSendResponse>('/auth-service/api/otp/resend', data),
};
