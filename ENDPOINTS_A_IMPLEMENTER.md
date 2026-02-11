# Endpoints à implémenter — Étape par étape

> **Base URL :** `https://galsen-invest.online`
> **Total : 71 endpoints** répartis sur 3 microservices

---

## Étape 1 — Mettre à jour les models

Les models actuels ne correspondent pas exactement aux réponses de l'API. Voici ce qu'il faut corriger :

### `api.model.ts` — Format réponse réel

```diff
 interface ApiResponse<T> {
   success: boolean;
+  status: number;
   message: string;
   data: T;
+  timestamp: string;
 }
```

Pagination réelle (Spring Boot) :
```diff
- data: T[]
- meta?: { current_page, last_page, per_page, total }
+ data: {
+   content: T[];
+   totalElements: number;
+   totalPages: number;
+   number: number;
+   size: number;
+   first: boolean;
+   last: boolean;
+ }
```

### `auth.model.ts` — Correspondance API

| Champ actuel | Champ API réel | Action |
|---|---|---|
| `email` (login) | `username` | ✏️ Renommer |
| `accessToken` | `access_token` | ✏️ Renommer |
| `refreshToken` | `refresh_token` | ✏️ Renommer |
| `expiresIn` | `expires_in` | ✏️ Renommer |
| — | `token_type`, `id_token`, `session_state`, `scope` | ➕ Ajouter |

### Nouveaux models à créer

| Model | Fichier |
|---|---|
| `InvestorProfile` | `investor.model.ts` |
| `BusinessProfile` | `business.model.ts` |
| `Pays`, `Sector` | `reference.model.ts` |
| `Category`, `CampaignPhoto` | `campaign.model.ts` |
| `WithdrawalRequest` | `wallet.model.ts` |
| `OtpSendRequest`, `OtpVerifyResponse` | `auth.model.ts` |

---

## Étape 2 — Auth Service (30 endpoints)

### 2.1 Authentification (Public)

| # | Méthode | Endpoint | Service fn | Status |
|---|---|---|---|---|
| 1.1 | `POST` | `/auth-service/api/auth/login` | `login()` | [ ] |
| 1.2 | `POST` | `/auth-service/api/auth/refresh?refreshToken=` | `refreshToken()` | [ ] |
| 1.3 | `POST` | `/auth-service/api/auth/register` | `register()` | [ ] |
| 1.4 | `POST` | `/auth-service/api/auth/register/investor` | `registerInvestor()` | [ ] |
| 1.5 | `POST` | `/auth-service/api/auth/register/business` | `registerBusiness()` | [ ] |
| 1.6 | `POST` | `/auth-service/api/auth/forgot-password` | `forgotPassword()` | [ ] |
| 1.7 | `POST` | `/auth-service/api/auth/logout` | `logout()` | [ ] |

### 2.2 OTP (Public)

| # | Méthode | Endpoint | Service fn | Status |
|---|---|---|---|---|
| 1.8 | `POST` | `/auth-service/api/otp/send` | `sendOtp()` | [ ] |
| 1.9 | `POST` | `/auth-service/api/otp/verify` | `verifyOtp()` | [ ] |
| 1.10 | `POST` | `/auth-service/api/otp/resend` | `resendOtp()` | [ ] |

### 2.3 Profils (JWT requis)

| # | Méthode | Endpoint | Service fn | Status |
|---|---|---|---|---|
| 1.11 | `GET` | `/auth-service/api/auth/profile/investor/me` | `getInvestorProfile()` | [ ] |
| 1.12 | `GET` | `/auth-service/api/auth/profile/business/me` | `getBusinessProfile()` | [ ] |
| 1.13 | `PUT` | `/auth-service/api/auth/profile/investor/me` | `updateInvestorProfile()` | [ ] |
| 1.14 | `PUT` | `/auth-service/api/auth/profile/business/me` | `updateBusinessProfile()` | [ ] |

### 2.4 KYC Documents (JWT requis)

| # | Méthode | Endpoint | Service fn | Status |
|---|---|---|---|---|
| 1.15 | `POST` | `/auth-service/api/v1/kyc/documents/upload` | `uploadKycDocument()` | [ ] |
| 1.16 | `GET` | `/auth-service/api/v1/kyc/documents/me` | `getMyKycDocuments()` | [ ] |
| 1.17 | `GET` | `/auth-service/api/v1/kyc/documents/{id}` | `getKycDocumentById()` | [ ] |
| 1.18 | `GET` | `/auth-service/api/v1/kyc/documents/user/{userId}` | `getKycByUser()` | [ ] |
| 1.19 | `GET` | `/auth-service/api/v1/kyc/documents/user/{userId}/paginated` | `getKycByUserPaginated()` | [ ] |
| 1.20 | `GET` | `/auth-service/api/v1/kyc/documents/pending` | `getPendingKycDocs()` | [ ] |
| 1.21 | `PUT` | `/auth-service/api/v1/kyc/documents/{id}/approve` | `approveKycDocument()` | [ ] |
| 1.22 | `PUT` | `/auth-service/api/v1/kyc/documents/{id}/reject?reason=` | `rejectKycDocument()` | [ ] |
| 1.23 | `DELETE` | `/auth-service/api/v1/kyc/documents/{id}` | `deleteKycDocument()` | [ ] |

### 2.5 Données de référence (Public)

| # | Méthode | Endpoint | Service fn | Status |
|---|---|---|---|---|
| 1.24 | `GET` | `/auth-service/api/pays` | `getCountries()` | [ ] |
| 1.25 | `GET` | `/auth-service/api/pays/{id}` | `getCountryById()` | [ ] |
| 1.26 | `GET` | `/auth-service/api/pays/code/{codeIso}` | `getCountryByCode()` | [ ] |
| 1.27 | `GET` | `/auth-service/api/sectors` | `getSectors()` | [ ] |
| 1.28 | `GET` | `/auth-service/api/sectors/{id}` | `getSectorById()` | [ ] |
| 1.29 | `GET` | `/auth-service/api/type-documents` | `getDocumentTypes()` | [ ] |
| 1.30 | `GET` | `/auth-service/api/type-entreprises` | `getBusinessTypes()` | [ ] |

---

## Étape 3 — Campaign Service (21 endpoints)

### 3.1 Campagnes CRUD

| # | Méthode | Endpoint | Auth | Service fn | Status |
|---|---|---|---|---|---|
| 2.1 | `POST` | `/campaign-service/api/v1/campaigns` | BUSINESS | `create()` | [ ] |
| 2.2 | `GET` | `/campaign-service/api/v1/campaigns` | Public | `getAll()` | [ ] |
| 2.3 | `GET` | `/campaign-service/api/v1/campaigns/{id}` | Public | `getById()` | [ ] |
| 2.9 | `PUT` | `/campaign-service/api/v1/campaigns/{id}` | BUSINESS | `update()` | [ ] |
| 2.16 | `DELETE` | `/campaign-service/api/v1/campaigns/{id}` | BUSINESS/ADMIN | `delete()` | [ ] |

### 3.2 Filtres & Recherche

| # | Méthode | Endpoint | Service fn | Status |
|---|---|---|---|---|
| 2.4 | `GET` | `/campaign-service/api/v1/campaigns/approved` | `getApproved()` | [ ] |
| 2.5 | `GET` | `/campaign-service/api/v1/campaigns/category/{categoryId}` | `getByCategory()` | [ ] |
| 2.6 | `GET` | `/campaign-service/api/v1/campaigns/status/{status}` | `getByStatus()` | [ ] |
| 2.7 | `GET` | `/campaign-service/api/v1/campaigns/search?keyword=` | `search()` | [ ] |
| 2.8 | `GET` | `/campaign-service/api/v1/campaigns/my-campaigns` | `getMyCampaigns()` | [ ] |

### 3.3 Actions campagnes

| # | Méthode | Endpoint | Auth | Service fn | Status |
|---|---|---|---|---|---|
| 2.10 | `POST` | `/campaign-service/api/v1/campaigns/{id}/submit` | BUSINESS | `submit()` | [ ] |
| 2.11 | `POST` | `/campaign-service/api/v1/campaigns/{id}/cover` | BUSINESS | `uploadCover()` | [ ] |
| 2.12 | `POST` | `/campaign-service/api/v1/campaigns/{id}/photos` | BUSINESS | `uploadPhotos()` | [ ] |
| 2.13 | `PATCH` | `/campaign-service/api/v1/campaigns/{id}/status` | BUSINESS/ADMIN | `changeStatus()` | [ ] |
| 2.14 | `PUT` | `/campaign-service/api/v1/campaigns/{id}/approve` | ADMIN | `approve()` | [ ] |
| 2.15 | `PUT` | `/campaign-service/api/v1/campaigns/{id}/reject` | ADMIN | `reject()` | [ ] |
| 2.17 | `DELETE` | `/campaign-service/api/v1/campaigns/{id}/photos/{photoId}` | BUSINESS | `deletePhoto()` | [ ] |

### 3.4 Catégories

| # | Méthode | Endpoint | Auth | Service fn | Status |
|---|---|---|---|---|---|
| 2.18 | `POST` | `/campaign-service/api/v1/categories` | ADMIN | `createCategory()` | [ ] |
| 2.19 | `GET` | `/campaign-service/api/v1/categories` | Public | `getCategories()` | [ ] |
| 2.20 | `GET` | `/campaign-service/api/v1/categories/{id}` | Public | `getCategoryById()` | [ ] |
| 2.21 | `DELETE` | `/campaign-service/api/v1/categories/{id}` | ADMIN | `deleteCategory()` | [ ] |

---

## Étape 4 — Investment Service (20 endpoints)

### 4.1 Investissements

| # | Méthode | Endpoint | Auth | Service fn | Status |
|---|---|---|---|---|---|
| 3.1 | `POST` | `/investment-service/api/investments` | INVESTOR | `create()` | [ ] |
| 3.2 | `GET` | `/investment-service/api/investments/investor/{id}` | INVESTOR/ADMIN | `getByInvestor()` | [ ] |
| 3.3 | `GET` | `/investment-service/api/investments/campaign/{id}` | BUSINESS/ADMIN | `getByCampaign()` | [ ] |
| 3.4 | `GET` | `/investment-service/api/investments/campaign/{id}/total` | JWT | `getCampaignTotal()` | [ ] |
| 3.5 | `DELETE` | `/investment-service/api/investments/{id}?reason=` | INVESTOR/ADMIN | `cancel()` | [ ] |

### 4.2 Wallet

| # | Méthode | Endpoint | Auth | Service fn | Status |
|---|---|---|---|---|---|
| 3.6 | `GET` | `/investment-service/api/wallets/me` | JWT | `getMyWallet()` | [ ] |
| 3.7 | `POST` | `/investment-service/api/wallets/me/deposit` | JWT | `deposit()` | [ ] |
| 3.8 | `GET` | `/investment-service/api/wallets/me/transactions` | JWT | `getMyTransactions()` | [ ] |
| 3.9 | `GET` | `/investment-service/api/wallets/{ownerType}/{ownerId}` | JWT | `getWalletByOwner()` | [ ] |
| 3.10 | `GET` | `/investment-service/api/wallets/{walletId}/transactions` | JWT | `getWalletTransactions()` | [ ] |
| 3.11 | `PUT` | `/investment-service/api/wallets/{walletId}/freeze` | ADMIN | `freezeWallet()` | [ ] |
| 3.12 | `PUT` | `/investment-service/api/wallets/{walletId}/activate` | ADMIN | `activateWallet()` | [ ] |

### 4.3 Retraits

| # | Méthode | Endpoint | Auth | Service fn | Status |
|---|---|---|---|---|---|
| 3.13 | `POST` | `/investment-service/api/withdrawals` | BUSINESS | `createWithdrawal()` | [ ] |
| 3.14 | `GET` | `/investment-service/api/withdrawals/my-withdrawals` | BUSINESS | `getMyWithdrawals()` | [ ] |
| 3.15 | `GET` | `/investment-service/api/withdrawals/{id}` | BUSINESS/ADMIN | `getWithdrawalById()` | [ ] |
| 3.16 | `DELETE` | `/investment-service/api/withdrawals/{id}` | BUSINESS | `cancelWithdrawal()` | [ ] |
| 3.17 | `GET` | `/investment-service/api/withdrawals/pending` | ADMIN | `getPendingWithdrawals()` | [ ] |
| 3.18 | `GET` | `/investment-service/api/withdrawals/status/{status}` | ADMIN | `getWithdrawalsByStatus()` | [ ] |
| 3.19 | `PUT` | `/investment-service/api/withdrawals/{id}/approve` | ADMIN | `approveWithdrawal()` | [ ] |
| 3.20 | `PUT` | `/investment-service/api/withdrawals/{id}/reject` | ADMIN | `rejectWithdrawal()` | [ ] |

---

## Étape 5 — Organisation fichiers services

| Fichier service | Endpoints |
|---|---|
| `authService.ts` | 1.1 → 1.7 + 1.8 → 1.10 (auth + OTP) |
| `profileService.ts` 🆕 | 1.11 → 1.14 (profils investor/business) |
| `kycService.ts` 🆕 | 1.15 → 1.23 (documents KYC) |
| `referenceService.ts` 🆕 | 1.24 → 1.30 (pays, secteurs, types) |
| `campaignService.ts` | 2.1 → 2.17 (campagnes) |
| `categoryService.ts` 🆕 | 2.18 → 2.21 (catégories) |
| `investmentService.ts` | 3.1 → 3.5 (investissements) |
| `walletService.ts` | 3.6 → 3.12 (wallet) |
| `withdrawalService.ts` 🆕 | 3.13 → 3.20 (retraits) |

---

## Résumé

| Service | Endpoints | Existant | À créer/modifier |
|---|---|---|---|
| Auth + OTP | 10 | ✅ authService | ✏️ Modifier |
| Profils | 4 | ❌ | 🆕 profileService |
| KYC | 9 | ❌ | 🆕 kycService |
| Référence | 7 | ❌ | 🆕 referenceService |
| Campagnes | 17 | ✅ campaignService | ✏️ Modifier |
| Catégories | 4 | ❌ | 🆕 categoryService |
| Investissements | 5 | ✅ investmentService | ✏️ Modifier |
| Wallet | 7 | ✅ walletService | ✏️ Modifier |
| Retraits | 8 | ❌ | 🆕 withdrawalService |
| **Total** | **71** | | |
