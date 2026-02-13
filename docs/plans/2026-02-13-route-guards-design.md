# Route Guards — Design Document

**Date:** 2026-02-13
**Objectif:** Protéger les routes authentifiées par rôle (investor/business/admin)

## Décisions

- **Approche:** Composant wrapper `<ProtectedRoute>` avec `<Navigate>`
- **Détection du rôle:** Décodage JWT côté client (pas d'appel API)
- **Redirect non-auth:** `/login?redirect=<currentPath>`
- **Mauvais rôle:** Toast "Non autorisé" + redirect `/login`

## Fichiers à créer

1. `src/app/config/jwt.ts` — Décodage JWT, extraction rôle
2. `src/app/components/ProtectedRoute.tsx` — Guard component

## Fichiers à modifier

3. `src/app/App.tsx` — Wrapper routes protégées
4. `src/app/pages/Login.tsx` — Support du param `?redirect=`

## Flux

```
Route protégée → ProtectedRoute
  ├─ Pas de token → Navigate /login?redirect=X
  ├─ Token invalide/expiré → Navigate /login
  ├─ Mauvais rôle → Toast + Navigate /login
  └─ OK → Render children
```
