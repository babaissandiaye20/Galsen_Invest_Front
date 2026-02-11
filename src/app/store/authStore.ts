/**
 * Store d'authentification — Zustand
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginRequest, RegisterInvestorRequest, RegisterBusinessRequest, OtpVerifyRequest, AuthTokens } from '../models';
import { authService, extractErrorMessage, setAuthTokenGetter } from '../services';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;

    login: (credentials: LoginRequest) => Promise<void>;
    registerInvestor: (data: RegisterInvestorRequest) => Promise<void>;
    registerBusiness: (data: RegisterBusinessRequest) => Promise<void>;
    verifyOtp: (data: OtpVerifyRequest) => Promise<void>;
    logout: () => Promise<void>;
    setTokens: (tokens: AuthTokens) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            login: async (credentials) => {
                set({ loading: true, error: null });
                try {
                    const res = await authService.login(credentials);
                    const { access_token, refresh_token } = res.data;
                    set({ token: access_token, refreshToken: refresh_token, isAuthenticated: true, loading: false });
                } catch (err: unknown) {
                    set({ error: extractErrorMessage(err, 'Erreur de connexion'), loading: false });
                    throw err;
                }
            },

            registerInvestor: async (data) => {
                set({ loading: true, error: null });
                try {
                    await authService.registerInvestor(data);
                    set({ loading: false });
                } catch (err: unknown) {
                    set({ error: extractErrorMessage(err, "Erreur d'inscription investisseur"), loading: false });
                    throw err;
                }
            },

            registerBusiness: async (data) => {
                set({ loading: true, error: null });
                try {
                    await authService.registerBusiness(data);
                    set({ loading: false });
                } catch (err: unknown) {
                    set({ error: extractErrorMessage(err, "Erreur d'inscription entreprise"), loading: false });
                    throw err;
                }
            },

            verifyOtp: async (data) => {
                set({ loading: true, error: null });
                try {
                    const res = await authService.verifyOtp(data);
                    if (res.verified) {
                        set({ isAuthenticated: true, loading: false });
                    } else {
                        set({ error: res.message || 'Code OTP invalide', loading: false });
                        throw new Error(res.message || 'Code OTP invalide');
                    }
                } catch (err: unknown) {
                    set({ error: extractErrorMessage(err, 'Code OTP invalide'), loading: false });
                    throw err;
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch {
                    // Ignore logout errors
                }
                set({ token: null, refreshToken: null, isAuthenticated: false });
            },

            setTokens: (tokens) => {
                set({ token: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated }),
        },
    ),
);

// Injecter le getter de token dans httpClient au démarrage
setAuthTokenGetter(() => useAuthStore.getState().token);
