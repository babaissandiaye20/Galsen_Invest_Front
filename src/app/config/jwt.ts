/**
 * Utilitaires JWT — décodage côté client (sans vérification de signature)
 */

export type UserRole = 'investor' | 'business' | 'admin';

/** Décode le payload d'un JWT (base64). */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Extrait les rôles Keycloak depuis le JWT (realm_access.roles). */
export function getRolesFromToken(token: string): string[] {
  const payload = parseJwtPayload(token);
  if (!payload) return [];
  return (payload as { realm_access?: { roles?: string[] } }).realm_access?.roles ?? [];
}

/** Retourne le rôle applicatif depuis le token. */
export function getUserRole(token: string | null): UserRole | null {
  if (!token) return null;
  const roles = getRolesFromToken(token);
  if (roles.includes('ADMIN')) return 'admin';
  if (roles.includes('BUSINESS')) return 'business';
  if (roles.includes('INVESTOR')) return 'investor';
  // Par défaut, si authentifié mais pas de rôle reconnu → investor
  return roles.length > 0 ? 'investor' : null;
}

/** Retourne la route dashboard selon le rôle. */
export function getDashboardRoute(role: UserRole | null): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'business': return '/business/dashboard';
    case 'investor': return '/investor/dashboard';
    default: return '/login';
  }
}

/** Extrait les infos utilisateur basiques depuis le JWT Keycloak. */
export interface JwtUserInfo {
  email: string | null;
  name: string | null;
  initials: string;
}

export function getUserInfoFromToken(token: string | null): JwtUserInfo {
  if (!token) return { email: null, name: null, initials: '?' };
  const payload = parseJwtPayload(token) as {
    preferred_username?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
  } | null;
  if (!payload) return { email: null, name: null, initials: '?' };

  const email = payload.email ?? payload.preferred_username ?? null;
  const name = payload.name
    ?? ([payload.given_name, payload.family_name].filter(Boolean).join(' ') || null);

  // Générer les initiales (2 lettres max)
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : email
      ? email[0].toUpperCase()
      : '?';

  return { email, name, initials };
}

/** Extrait l'ID utilisateur (claim 'sub') depuis le JWT Keycloak. */
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.sub !== 'string') return null;
  return payload.sub;
}

/** Vérifie si le token JWT est expiré. */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  // exp est en secondes, Date.now() en millisecondes
  return payload.exp * 1000 < Date.now();
}
