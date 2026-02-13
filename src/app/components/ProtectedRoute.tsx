import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { getUserRole, isTokenExpired, type UserRole } from '../config/jwt';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Route guard — vérifie l'authentification et le rôle.
 *
 * - Pas authentifié → redirect /login (avec state.from pour retour)
 * - Token expiré → logout + redirect /login
 * - Mauvais rôle → toast "Non autorisé" + redirect /login
 * - OK → render children
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Déterminer la raison du refus (sans side effects pendant le render)
  const expired = token ? isTokenExpired(token) : false;
  const role = token ? getUserRole(token) : null;
  const unauthorizedRole = allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role);

  // Side effects (toast, logout) exécutés APRÈS le render via useEffect
  const hasHandledExpiry = useRef(false);
  useEffect(() => {
    if (expired && !hasHandledExpiry.current) {
      hasHandledExpiry.current = true;
      logout();
    }
  }, [expired, logout]);

  useEffect(() => {
    if (unauthorizedRole) {
      toast.error('Non autorisé — accès refusé');
    }
  }, [unauthorizedRole]);

  // 1. Pas authentifié
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Token expiré
  if (expired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Mauvais rôle
  if (unauthorizedRole) {
    return <Navigate to="/login" replace />;
  }

  // 4. OK
  return <>{children}</>;
}
