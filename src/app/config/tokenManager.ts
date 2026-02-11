/**
 * Gestion du token d'authentification
 * Lit directement depuis le persist Zustand (clé 'auth-storage').
 * Le store Zustand est la seule source de vérité.
 */
const STORE_KEY = 'auth-storage';

function getPersistedState(): { token?: string | null } | null {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return null;
        return JSON.parse(raw)?.state ?? null;
    } catch {
        return null;
    }
}

export const tokenManager = {
    get: (): string | null => getPersistedState()?.token ?? null,
    remove: (): void => localStorage.removeItem(STORE_KEY),
};
