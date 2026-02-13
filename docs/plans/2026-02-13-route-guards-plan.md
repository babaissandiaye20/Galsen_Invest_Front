# Route Guards — Plan d'implémentation

## Tâche 1 : Créer `src/app/config/jwt.ts`
- Extraire `parseJwtPayload` et `getRolesFromToken` depuis Login.tsx
- Ajouter `getUserRole()` qui retourne `'investor' | 'business' | 'admin' | null`
- Ajouter `getDashboardRoute(role)` qui retourne le path du dashboard par rôle
- Ajouter `isTokenExpired(token)` qui vérifie le champ `exp` du JWT
- Vérification : le fichier compile sans erreur

## Tâche 2 : Créer `src/app/components/ProtectedRoute.tsx`
- Props : `allowedRoles?: ('investor' | 'business' | 'admin')[]`, `children: ReactNode`
- Lire `token` et `isAuthenticated` depuis `useAuthStore`
- Si pas authentifié → `<Navigate to="/login" state={{ from: location }} replace />`
- Si token expiré → logout + Navigate /login
- Si rôle non autorisé → toast "Non autorisé" + Navigate /login
- Si OK → render children
- Vérification : le fichier compile sans erreur

## Tâche 3 : Mettre à jour `src/app/App.tsx`
- Importer ProtectedRoute
- Wrapper les routes `/investor/*` avec `allowedRoles={['investor']}`
- Wrapper les routes `/business/*` avec `allowedRoles={['business']}`
- Wrapper les routes `/admin/*` avec `allowedRoles={['admin']}`
- Routes publiques : `/`, `/login`, `/register/*`, `/verify-otp`, `/campaigns`
- Vérification : `npm run build` passe

## Tâche 4 : Mettre à jour `src/app/pages/Login.tsx`
- Importer les fonctions depuis `jwt.ts` (supprimer les doublons locaux)
- Lire `location.state.from` après login réussi
- Si `from` existe → naviguer vers `from.pathname`
- Sinon → naviguer vers le dashboard par rôle
- Vérification : `npm run build` passe
