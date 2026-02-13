/**
 * Client HTTP central basé sur ofetch
 */
import { ofetch, type FetchOptions } from 'ofetch';
import { API_BASE_URL } from '../config/environment';

// Import direct du store pour avoir accès au token en temps réel
let getAuthToken: (() => string | null) | null = null;

// Fonction pour injecter le getter du token depuis le store
export function setAuthTokenGetter(getter: () => string | null) {
    getAuthToken = getter;
}

// ─── Instance ofetch ─────────────────────────────────────────────────────────

const httpClient = ofetch.create({
    baseURL: API_BASE_URL,
    retry: 1,
    retryDelay: 500,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],

    async onRequest({ options, request }) {
        // Initialiser les headers
        options.headers = new Headers(options.headers);
        
        // Toujours demander du JSON
        options.headers.set('Accept', 'application/json');
        
        // Ne pas forcer Content-Type si c'est un FormData (multipart/form-data)
        // Le navigateur définira automatiquement le bon Content-Type avec boundary
        if (!(options.body instanceof FormData)) {
            options.headers.set('Content-Type', 'application/json');
        }
        
        // Liste des endpoints publics qui ne nécessitent pas de token
        const publicEndpoints = [
            '/auth-service/api/pays',
            '/auth-service/api/sectors',
            '/auth-service/api/auth/register',
            '/auth-service/api/auth/login',
            '/auth-service/api/otp/',
            '/campaign-service/api/v1/campaigns',
            '/campaign-service/api/v1/campaigns/approved',
            '/campaign-service/api/v1/categories',
        ];

        // Vérifier si l'endpoint est public
        // On utilise une vérification précise : l'URL doit contenir l'endpoint
        // suivi de la fin, d'un '?' (query params), ou rien d'autre dans le path
        const requestUrl = String(request);
        const isPublicEndpoint = publicEndpoints.some(endpoint => {
            const idx = requestUrl.indexOf(endpoint);
            if (idx === -1) return false;
            const after = requestUrl[idx + endpoint.length];
            // Public si l'endpoint est en fin d'URL, suivi de '?' ou rien
            return after === undefined || after === '?' || after === '#';
        });
        
        // Ajouter le token seulement si ce n'est pas un endpoint public
        if (!isPublicEndpoint) {
            // Récupérer le token directement depuis le store Zustand (en temps réel)
            const token = getAuthToken?.() ?? null;
            if (token) {
                options.headers.set('Authorization', `Bearer ${token}`);
            }
        }
    },

    async onResponseError({ response }) {
        // Ne rediriger vers login QUE si l'erreur vient d'un endpoint d'authentification critique
        // Ignorer les 401 sur les endpoints optionnels (campagnes, investissements)
        if (response.status === 401) {
            const url = String(response.url || '');
            
            // Endpoints critiques qui nécessitent vraiment une authentification
            const criticalEndpoints = [
                '/auth/profile/investor/me',
                '/auth/profile/business/me',
                '/auth/logout'
            ];
            
            const isCritical = criticalEndpoints.some(endpoint => url.includes(endpoint));
            
            if (isCritical) {
                console.error('🚫 Erreur 401 sur endpoint critique - déconnexion');
                const { useAuthStore } = await import('../store/authStore');
                useAuthStore.getState().logout();
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else {
                console.warn('⚠️ Erreur 401 sur endpoint optionnel - ignorée:', url);
            }
        }
    },
});

// ─── Fonctions utilitaires ───────────────────────────────────────────────────

export async function apiGet<T>(url: string, options?: FetchOptions): Promise<T> {
    const res = await httpClient(url, { ...options, method: 'GET' });
    return res as unknown as T;
}

export async function apiPost<T>(url: string, body?: NonNullable<FetchOptions['body']>, options?: FetchOptions): Promise<T> {
    const res = await httpClient(url, { ...options, method: 'POST', body });
    return res as unknown as T;
}

export async function apiPut<T>(url: string, body?: NonNullable<FetchOptions['body']>, options?: FetchOptions): Promise<T> {
    const res = await httpClient(url, { ...options, method: 'PUT', body });
    return res as unknown as T;
}


export async function apiPatch<T>(url: string, body?: NonNullable<FetchOptions['body']>, options?: FetchOptions): Promise<T> {
    const res = await httpClient(url, { ...options, method: 'PATCH', body });
    return res as unknown as T;
}

export async function apiDelete<T>(url: string, options?: FetchOptions): Promise<T> {
    const res = await httpClient(url, { ...options, method: 'DELETE' });
    return res as unknown as T;
}

// ─── Extraction message d'erreur backend ────────────────────────────────────

/**
 * Extrait le message d'erreur lisible depuis un FetchError ofetch.
 * ofetch met le body JSON parsé dans `error.data`.
 * Le backend renvoie soit `{ detail: "..." }` (erreurs) soit `{ message: "..." }` (réponses).
 */
export function extractErrorMessage(err: unknown, fallback = 'Une erreur est survenue'): string {
    if (err && typeof err === 'object') {
        const fetchErr = err as { data?: { detail?: string; message?: string }; message?: string };
        // 1. Message détaillé du backend (format ApiError)
        if (fetchErr.data?.detail) return fetchErr.data.detail;
        // 2. Message du backend (format ApiResponse erreur)
        if (fetchErr.data?.message) return fetchErr.data.message;
        // 3. Message générique ofetch (ex: "[POST] ...: 400 Bad Request")
        if (fetchErr.message) return fetchErr.message;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

export default httpClient;

