# Galsen Invest - API Documentation Frontend

**Base URL:** `https://galsen-invest.online`

**Date:** Fevrier 2026

---

## Setup React (ofetch + TanStack Query)

```bash
npm install ofetch @tanstack/react-query
```

### `lib/api.ts`

```typescript
import { ofetch } from 'ofetch'

export const API_BASE = 'https://galsen-invest.online'

export const api = ofetch.create({
  baseURL: API_BASE,
  onRequest({ options }) {
    const token = localStorage.getItem('access_token')
    if (token) {
      options.headers = { ...options.headers, Authorization: `Bearer ${token}` }
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
  }
})
```

### `main.tsx` (Provider)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}
```

---

## Format de reponse global

Tous les endpoints retournent un wrapper `ApiResponse` :

```json
{
  "success": true,
  "status": 200,
  "message": "Description du resultat",
  "data": { ... },
  "timestamp": "2026-02-10T19:03:18.676Z"
}
```

En cas d'erreur :

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Le titre doit faire entre 10 et 200 caracteres",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-02-10T19:03:18.676Z"
}
```

---

## Headers requis

```
Content-Type: application/json
Authorization: Bearer <access_token>   (pour les endpoints proteges)
```

---

## Pagination

Tous les endpoints pagines acceptent ces query params :

```
?page=0&size=20&sort=createdAt,desc
```

Reponse paginee :

```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "totalElements": 42,
    "totalPages": 3,
    "number": 0,
    "size": 20,
    "first": true,
    "last": false
  }
}
```

---

## Routing Gateway

Le gateway route automatiquement :

| Prefixe URL | Service cible |
|-------------|--------------|
| `/auth-service/**` | Auth Service (8081) |
| `/campaign-service/**` | Campaign Service (8082) |
| `/investment-service/**` | Investment Service (8083) |

---

# 1. AUTH SERVICE

## 1.1 Login

```
POST /auth-service/api/auth/login
```

**Auth:** Public

**Request:**

```json
{
  "username": "babaissandiaye31@gmail.com",
  "password": "Passer123"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "token_type": "Bearer",
    "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "session_state": "8e7e7e7e-7e7e-7e7e-7e7e-7e7e7e7e7e7e",
    "scope": "openid profile email"
  }
}
```

**React:**

```tsx
const login = useMutation({
  mutationFn: (creds: { username: string; password: string }) =>
    api('/auth-service/api/auth/login', { method: 'POST', body: creds }),
  onSuccess: (res) => {
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
  }
})
```

---

## 1.2 Refresh Token

```
POST /auth-service/api/auth/refresh?refreshToken=<refresh_token>
```

**Auth:** Public

**Request:** Query param `refreshToken`

**Response 200:** Meme format que login

**React:**

```tsx
const refreshToken = async () => {
  const rt = localStorage.getItem('refresh_token')
  const res = await api(`/auth-service/api/auth/refresh?refreshToken=${rt}`, { method: 'POST' })
  localStorage.setItem('access_token', res.data.access_token)
  localStorage.setItem('refresh_token', res.data.refresh_token)
}
```

---

## 1.3 Register (generique)

```
POST /auth-service/api/auth/register
```

**Auth:** Public

**Request:**

```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+221771234567",
  "userType": "investor"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "keycloak-uuid",
    "username": "john.doe@example.com",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "enabled": true,
    "email_verified": false,
    "roles": ["investor"],
    "created_at": "2026-02-10T22:17:28Z",
    "message": "User created successfully"
  }
}
```

---

## 1.4 Register Investor

```
POST /auth-service/api/auth/register/investor
```

**Auth:** Public

**Request:**

```json
{
  "email": "investisseur@example.com",
  "password": "SecurePass123!",
  "phone": "+221771234567",
  "firstName": "Mamadou",
  "lastName": "Diallo",
  "birthDate": "1990-05-15",
  "investorType": "INDIVIDUAL",
  "nationalityIsoCode": "SN",
  "residenceCountryIsoCode": "SN",
  "city": "Dakar",
  "address": "Sicap Liberte 6",
  "occupation": "Ingenieur informatique",
  "incomeBracket": "MID",
  "isPep": false
}
```

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| email | string | oui | format email, max 100 |
| password | string | oui | 8-100 chars, 1 majuscule, 1 minuscule, 1 chiffre |
| phone | string | oui | format `+221XXXXXXXXX` |
| firstName | string | oui | 2-100 chars |
| lastName | string | oui | 2-100 chars |
| birthDate | string | non | format `YYYY-MM-DD`, dans le passe |
| investorType | enum | non | `INDIVIDUAL` (defaut), `INSTITUTIONAL` |
| nationalityIsoCode | string | non | 2 lettres ISO (ex: `SN`) |
| residenceCountryIsoCode | string | non | 2 lettres ISO |
| city | string | non | max 100 |
| address | string | non | max 255 |
| occupation | string | non | max 100 |
| incomeBracket | enum | non | `LOW`, `MID`, `HIGH`, `VERY_HIGH` |
| isPep | boolean | non | defaut `false` |

**Response 201:** Meme format que register generique

---

## 1.5 Register Business

```
POST /auth-service/api/auth/register/business
```

**Auth:** Public

**Request:**

```json
{
  "email": "contact@entreprise.sn",
  "password": "SecurePass123!",
  "phone": "+221771234567",
  "companyName": "Galsen Tech SARL",
  "legalForm": "SARL",
  "sectorId": "550e8400-e29b-41d4-a716-446655440000",
  "tradeName": "GalsenTech",
  "registrationNumber": "SN-DKR-2020-B-12345",
  "taxId": "12345678901234",
  "foundedDate": "2020-01-15",
  "representativeName": "Abdoulaye Diop",
  "representativeTitle": "Gerant",
  "countryIsoCode": "SN",
  "address": "Rue 10, Plateau",
  "city": "Dakar",
  "websiteUrl": "https://www.galsentech.sn",
  "description": "Entreprise specialisee dans les solutions fintech...",
  "employeeCount": 15,
  "annualRevenue": 50000000
}
```

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| email | string | oui | format email, max 100 |
| password | string | oui | 8-100 chars, 1 maj, 1 min, 1 chiffre |
| phone | string | oui | format `+221XXXXXXXXX` |
| companyName | string | oui | 2-200 chars |
| legalForm | enum | oui | `SARL`, `SA`, `SAS`, `SUARL`, `SNC`, `GIE`, `ASSOCIATION`, `OTHER` |
| sectorId | string (UUID) | oui | UUID du secteur |
| tradeName | string | non | max 200 |
| registrationNumber | string | non | RCCM, max 50 |
| taxId | string | non | NINEA, max 50 |
| foundedDate | string | non | `YYYY-MM-DD`, dans le passe |
| representativeName | string | non | max 200 |
| representativeTitle | string | non | max 100 |
| countryIsoCode | string | non | 2 lettres ISO |
| address | string | non | max 255 |
| city | string | non | max 100 |
| websiteUrl | string | non | URL valide, max 255 |
| description | string | non | max 2000 |
| employeeCount | integer | non | min 1 |
| annualRevenue | number | non | min 0 |

**Response 201:** Meme format que register generique

---

## 1.6 Forgot Password

```
POST /auth-service/api/auth/forgot-password
```

**Auth:** Public

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Si cet email existe, un lien de reinitialisation a ete envoye.",
  "data": null
}
```

---

## 1.7 Logout

```
POST /auth-service/api/auth/logout
```

**Auth:** JWT requis

**Request:** Aucun body

**Response 200:**

```json
{
  "success": true,
  "message": "Deconnexion reussie. Toutes vos sessions ont ete invalidees.",
  "data": null
}
```

**React:**

```tsx
const logout = useMutation({
  mutationFn: () => api('/auth-service/api/auth/logout', { method: 'POST' }),
  onSuccess: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }
})
```

---

## 1.8 Envoyer OTP

```
POST /auth-service/api/otp/send
```

**Auth:** Public

**Request:**

```json
{
  "email": "investisseur@example.com",
  "type": "EMAIL"
}
```

| Champ | Type | Requis | Valeurs |
|-------|------|--------|---------|
| email | string | oui | format email |
| type | enum | oui | `EMAIL`, `SMS`, `WHATSAPP` |

**Response 200:**

```json
{
  "sent": true,
  "message": "Code OTP envoye a inv***@example.com. Valide pendant 5 minutes.",
  "expiresAt": "2026-02-10T19:35:00Z"
}
```

---

## 1.9 Verifier OTP

```
POST /auth-service/api/otp/verify
```

**Auth:** Public

**Request:**

```json
{
  "email": "investisseur@example.com",
  "code": "123456"
}
```

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| email | string | oui | format email |
| code | string | oui | exactement 6 chiffres |

**Response 200 (succes):**

```json
{
  "verified": true,
  "message": "Compte active avec succes ! Vous pouvez maintenant vous connecter.",
  "email": "investisseur@example.com",
  "userStatus": "ACTIVE"
}
```

**Response 401 (echec):**

```json
{
  "verified": false,
  "message": "Code invalide ou expire",
  "attemptsRemaining": 2
}
```

---

## 1.10 Renvoyer OTP

```
POST /auth-service/api/otp/resend
```

**Auth:** Public

**Request:** Meme format que `/otp/send`

**Response 200:** Meme format que `/otp/send`

---

## 1.11 Mon profil Investor

```
GET /auth-service/api/auth/profile/investor/me
```

**Auth:** JWT | **Role:** INVESTOR

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "investorType": "INDIVIDUAL",
    "firstName": "Mamadou",
    "lastName": "Diallo",
    "birthDate": "1990-05-15",
    "nationalityName": "Senegal",
    "nationalityIsoCode": "SN",
    "address": "Sicap Liberte 6",
    "city": "Dakar",
    "residenceCountryName": "Senegal",
    "residenceCountryIsoCode": "SN",
    "kycLevel": "L0",
    "verificationStatus": "UNVERIFIED",
    "occupation": "Ingenieur informatique",
    "incomeBracket": "MID",
    "pep": false,
    "monthlyInvestmentCap": 0.0,
    "lifetimeInvestmentCap": 0.0,
    "totalInvested": 0.0,
    "remainingMonthlyCapacity": 0.0,
    "remainingLifetimeCapacity": 0.0,
    "bio": null,
    "user": {
      "email": "investisseur@example.com",
      "phone": "+221771234567",
      "status": "ACTIVE"
    }
  }
}
```

**React:**

```tsx
const { data: profile, isLoading } = useQuery({
  queryKey: ['investor-profile'],
  queryFn: () => api('/auth-service/api/auth/profile/investor/me')
})
```

---

## 1.12 Mon profil Business

```
GET /auth-service/api/auth/profile/business/me
```

**Auth:** JWT | **Role:** BUSINESS

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "keycloak-uuid",
    "companyName": "Galsen Tech SARL",
    "tradeName": "GalsenTech",
    "legalForm": "SARL",
    "registrationNumber": "SN-DKR-2020-B-12345",
    "taxId": "12345678901234",
    "foundedDate": "2020-01-15",
    "representativeName": "Abdoulaye Diop",
    "representativeTitle": "Gerant",
    "sectorLibelle": "Fintech",
    "description": "Entreprise specialisee...",
    "websiteUrl": "https://www.galsentech.sn",
    "employeeCount": 15,
    "annualRevenue": 50000000,
    "address": "Rue 10, Plateau",
    "city": "Dakar",
    "countryName": "Senegal",
    "verificationStatus": "UNVERIFIED",
    "maxCampaignAmount": null,
    "maxConcurrentCampaigns": null,
    "totalRaised": 0,
    "user": {
      "email": "contact@entreprise.sn",
      "phone": "+221771234567",
      "status": "ACTIVE"
    }
  }
}
```

---

## 1.13 Modifier profil Investor

```
PUT /auth-service/api/auth/profile/investor/me
```

**Auth:** JWT | **Role:** INVESTOR

**Request (tous les champs sont optionnels):**

```json
{
  "firstName": "Mamadou",
  "lastName": "Diallo",
  "birthDate": "1990-05-15",
  "type": "INDIVIDUAL",
  "nationalityId": "uuid-pays",
  "residenceCountryId": "uuid-pays",
  "address": "123 Rue de la Republique",
  "city": "Dakar",
  "occupation": "Ingenieur informatique",
  "incomeBracket": "MID",
  "pep": false,
  "bio": "Investisseur passionne..."
}
```

**Response 200:** Meme format que GET profil investor

---

## 1.14 Modifier profil Business

```
PUT /auth-service/api/auth/profile/business/me
```

**Auth:** JWT | **Role:** BUSINESS

**Request (tous les champs sont optionnels):**

```json
{
  "companyName": "Galsen Tech SARL",
  "tradeName": "GalsenTech",
  "legalForm": "SARL",
  "registrationNumber": "SN-DKR-2020-B-12345",
  "taxId": "12345678901234",
  "foundedDate": "2020-01-15",
  "representativeName": "Amadou Ba",
  "representativeTitle": "Gerant",
  "sectorId": "uuid-sector",
  "description": "Description de l'activite...",
  "websiteUrl": "https://www.galsentech.sn",
  "employeeCount": 15,
  "annualRevenue": 50000000,
  "address": "Zone Industrielle, Lot 42",
  "city": "Dakar",
  "countryId": "uuid-pays"
}
```

**Response 200:** Meme format que GET profil business

---

## 1.15 Upload document KYC

```
POST /auth-service/api/v1/kyc/documents/upload
```

**Auth:** JWT

**Content-Type:** `multipart/form-data`

| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| userId | UUID | oui | ID de l'utilisateur |
| documentType | enum | oui | Type de document |
| file | binary | oui | Fichier image ou PDF |

**documentType values:** `ID_CARD_FRONT`, `ID_CARD_BACK`, `PASSPORT`, `SELFIE`, `INCOME_PROOF`, `ADDRESS_PROOF`, `RCCM`, `NINEA`

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "ID_CARD_FRONT",
    "fileUrl": "https://res.cloudinary.com/xxx/image/upload/v123/kyc/user123/doc.jpg",
    "publicId": "galsen-invest/kyc/user123/abc123",
    "originalFilename": "ma_cni.jpg",
    "contentType": "image/jpeg",
    "fileSize": 245678,
    "status": "PENDING",
    "rejectionReason": null,
    "processedAt": null,
    "createdAt": "2026-02-10T22:17:28Z"
  }
}
```

**React:**

```tsx
const uploadKYC = useMutation({
  mutationFn: async ({ userId, documentType, file }: { userId: string; documentType: string; file: File }) => {
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('documentType', documentType)
    formData.append('file', file)
    return api('/auth-service/api/v1/kyc/documents/upload', {
      method: 'POST',
      body: formData
    })
  }
})
```

---

## 1.16 Mes documents KYC

```
GET /auth-service/api/v1/kyc/documents/me?status=PENDING&type=ID_CARD_FRONT&page=0&size=10
```

**Auth:** JWT

**Query params (tous optionnels):**

| Param | Type | Valeurs |
|-------|------|---------|
| status | enum | `PENDING`, `APPROVED`, `REJECTED` |
| type | enum | `ID_CARD_FRONT`, `ID_CARD_BACK`, `PASSPORT`, etc. |
| page | int | defaut 0 |
| size | int | defaut 10 |

**Response 200:** Page de `KYCDocumentDTO`

---

## 1.17 Document KYC par ID

```
GET /auth-service/api/v1/kyc/documents/{documentId}
```

**Auth:** JWT

**Response 200:** `KYCDocumentDTO`

---

## 1.18 Documents d'un utilisateur

```
GET /auth-service/api/v1/kyc/documents/user/{userId}
```

**Auth:** JWT

**Response 200:** Liste de `KYCDocumentDTO`

---

## 1.19 Documents d'un utilisateur (pagine)

```
GET /auth-service/api/v1/kyc/documents/user/{userId}/paginated?page=0&size=10
```

**Auth:** JWT

**Response 200:** Page de `KYCDocumentDTO`

---

## 1.20 Documents en attente (Admin)

```
GET /auth-service/api/v1/kyc/documents/pending?page=0&size=20
```

**Auth:** JWT | **Role:** ADMIN

**Response 200:** Page de `KYCDocumentDTO` avec status PENDING

---

## 1.21 Approuver un document KYC (Admin)

```
PUT /auth-service/api/v1/kyc/documents/{documentId}/approve
```

**Auth:** JWT | **Role:** ADMIN

**Response 200:** `KYCDocumentDTO` avec status `APPROVED`

---

## 1.22 Rejeter un document KYC (Admin)

```
PUT /auth-service/api/v1/kyc/documents/{documentId}/reject?reason=Document illisible
```

**Auth:** JWT | **Role:** ADMIN

**Query param:** `reason` (requis)

**Response 200:** `KYCDocumentDTO` avec status `REJECTED`

---

## 1.23 Supprimer un document KYC

```
DELETE /auth-service/api/v1/kyc/documents/{documentId}
```

**Auth:** JWT

**Response 200:** `{ "success": true, "message": "Document supprime" }`

---

## 1.24 Liste des pays

```
GET /auth-service/api/pays
GET /auth-service/api/pays?page=0&size=20&sort=libelle,asc
```

**Auth:** Public

**Response 200:**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "libelle": "Senegal", "codeIso": "SN", "indicatifTel": "+221" },
    { "id": "uuid", "libelle": "Cote d'Ivoire", "codeIso": "CI", "indicatifTel": "+225" }
  ]
}
```

---

## 1.25 Pays par ID

```
GET /auth-service/api/pays/{id}
```

**Auth:** Public

**Response 200:** Un objet `PaysDTO`

---

## 1.26 Pays par code ISO

```
GET /auth-service/api/pays/code/{codeIso}
```

**Auth:** Public | **Exemple:** `/api/pays/code/SN`

**Response 200:** Un objet `PaysDTO`

---

## 1.27 Liste des secteurs

```
GET /auth-service/api/sectors
```

**Auth:** Public

**Response 200:**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "libelle": "Agritech", "description": "..." },
    { "id": "uuid", "libelle": "Fintech", "description": "..." }
  ]
}
```

---

## 1.28 Secteur par ID

```
GET /auth-service/api/sectors/{id}
```

**Auth:** Public

---

## 1.29 Liste des types de documents

```
GET /auth-service/api/type-documents
```

**Auth:** Public

---

## 1.30 Liste des types d'entreprises

```
GET /auth-service/api/type-entreprises
```

**Auth:** Public

---

# 2. CAMPAIGN SERVICE

## 2.1 Creer une campagne

```
POST /campaign-service/api/v1/campaigns
```

**Auth:** JWT | **Role:** BUSINESS

**Content-Type:** `multipart/form-data`

| Param | Type | Requis | Validation |
|-------|------|--------|------------|
| categoryId | UUID | oui | ID de la categorie |
| title | string | oui | 10-200 chars |
| description | string | oui | 50-5000 chars |
| targetAmount | number | oui | min 100000 FCFA |
| startDate | string | oui | `yyyy-MM-dd`, today ou futur |
| endDate | string | oui | `yyyy-MM-dd`, futur |
| coverImage | binary | non | Image de couverture |

**Response 201:** `CampaignResponse`

```json
{
  "id": "uuid",
  "businessProfileId": "uuid",
  "categoryId": "uuid",
  "categoryLibelle": "Agritech",
  "title": "Extension ferme solaire Kaolack",
  "description": "Ce projet vise a etendre...",
  "targetAmount": 5000000,
  "raisedAmount": 0,
  "devise": "XOF",
  "fundingPercentage": 0.0,
  "startDate": "2024-06-01",
  "endDate": "2024-09-01",
  "status": "DRAFT",
  "coverImageUrl": "https://res.cloudinary.com/...",
  "createdAt": "2026-02-10T22:17:28Z",
  "updatedAt": "2026-02-10T22:17:28Z",
  "reviewedBy": null,
  "reviewedAt": null,
  "rejectionReason": null
}
```

**React:**

```tsx
const createCampaign = useMutation({
  mutationFn: async (data: { categoryId: string; title: string; description: string; targetAmount: number; startDate: string; endDate: string; coverImage?: File }) => {
    const formData = new FormData()
    formData.append('categoryId', data.categoryId)
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('targetAmount', data.targetAmount.toString())
    formData.append('startDate', data.startDate)
    formData.append('endDate', data.endDate)
    if (data.coverImage) formData.append('coverImage', data.coverImage)
    return api('/campaign-service/api/v1/campaigns', { method: 'POST', body: formData })
  }
})
```

**Status flow:** `DRAFT` -> `REVIEW` -> `APPROVED` / `REJECTED` -> `FUNDED` -> `CLOSED`

---

## 2.2 Lister toutes les campagnes

```
GET /campaign-service/api/v1/campaigns?page=0&size=20&sort=createdAt,desc
```

**Auth:** Public

**Response 200:** Page de `CampaignResponse`

---

## 2.3 Campagne par ID

```
GET /campaign-service/api/v1/campaigns/{id}
```

**Auth:** Public

**Response 200:** `CampaignResponse`

---

## 2.4 Campagnes approuvees (pour investissement)

```
GET /campaign-service/api/v1/campaigns/approved?page=0&size=20
```

**Auth:** Public

**Response 200:** Page de `CampaignResponse` avec status `APPROVED`

**React:**

```tsx
const { data: campaigns } = useQuery({
  queryKey: ['campaigns', 'approved', page],
  queryFn: () => api(`/campaign-service/api/v1/campaigns/approved?page=${page}&size=20`)
})
```

---

## 2.5 Campagnes par categorie

```
GET /campaign-service/api/v1/campaigns/category/{categoryId}?page=0&size=20
```

**Auth:** Public

---

## 2.6 Campagnes par statut

```
GET /campaign-service/api/v1/campaigns/status/{status}?page=0&size=20
```

**Auth:** Public

**status values:** `DRAFT`, `REVIEW`, `APPROVED`, `REJECTED`, `FUNDED`, `CLOSED`

---

## 2.7 Rechercher des campagnes

```
GET /campaign-service/api/v1/campaigns/search?keyword=solaire&page=0&size=20
```

**Auth:** Public

---

## 2.8 Mes campagnes (Business)

```
GET /campaign-service/api/v1/campaigns/my-campaigns?page=0&size=20
```

**Auth:** JWT | **Role:** BUSINESS

---

## 2.9 Modifier une campagne

```
PUT /campaign-service/api/v1/campaigns/{id}
```

**Auth:** JWT | **Role:** BUSINESS (statut DRAFT ou REJECTED uniquement)

**Request:**

```json
{
  "title": "Nouveau titre de la campagne",
  "description": "Nouvelle description...",
  "targetAmount": 6000000,
  "startDate": "2024-07-01",
  "endDate": "2024-10-01"
}
```

---

## 2.10 Soumettre une campagne pour revision

```
POST /campaign-service/api/v1/campaigns/{id}/submit
```

**Auth:** JWT | **Role:** BUSINESS

**Request:** Aucun body (passe de DRAFT -> REVIEW)

**Response 200:** `CampaignResponse` avec status `REVIEW`

---

## 2.11 Upload cover image

```
POST /campaign-service/api/v1/campaigns/{id}/cover
```

**Auth:** JWT | **Role:** BUSINESS

**Content-Type:** `multipart/form-data`

| Param | Type | Requis |
|-------|------|--------|
| coverImage | binary | oui |

---

## 2.12 Upload photos

```
POST /campaign-service/api/v1/campaigns/{campaignId}/photos
```

**Auth:** JWT | **Role:** BUSINESS

**Content-Type:** `multipart/form-data`

| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| photos | binary[] | oui | 1 a 10 photos |

**Response 200:**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "url": "https://res.cloudinary.com/...", "position": 0 }
  ]
}
```

---

## 2.13 Changer le statut (generique)

```
PATCH /campaign-service/api/v1/campaigns/{id}/status
```

**Auth:** JWT | **Role:** BUSINESS ou ADMIN

**Request:**

```json
{
  "status": "REVIEW",
  "reason": null
}
```

---

## 2.14 Approuver une campagne (Admin)

```
PUT /campaign-service/api/v1/campaigns/{id}/approve
```

**Auth:** JWT | **Role:** ADMIN

**Request:** Aucun body

---

## 2.15 Rejeter une campagne (Admin)

```
PUT /campaign-service/api/v1/campaigns/{id}/reject
```

**Auth:** JWT | **Role:** ADMIN

**Request:**

```json
{
  "rejectionReason": "Documents insuffisants, veuillez fournir le RCCM"
}
```

---

## 2.16 Supprimer une campagne

```
DELETE /campaign-service/api/v1/campaigns/{id}
```

**Auth:** JWT | **Role:** BUSINESS (proprietaire) ou ADMIN

**Response 204:** No Content

---

## 2.17 Supprimer une photo

```
DELETE /campaign-service/api/v1/campaigns/{campaignId}/photos/{photoId}
```

**Auth:** JWT | **Role:** BUSINESS

---

## 2.18 Creer une categorie (Admin)

```
POST /campaign-service/api/v1/categories
```

**Auth:** JWT | **Role:** ADMIN

**Request:**

```json
{
  "libelle": "Agritech",
  "description": "Technologie agricole et agro-industrielle"
}
```

**Response 201:**

```json
{
  "id": "uuid",
  "libelle": "Agritech",
  "description": "Technologie agricole et agro-industrielle"
}
```

---

## 2.19 Lister les categories

```
GET /campaign-service/api/v1/categories
```

**Auth:** Public

**Response 200:** Liste de `CategoryResponse`

**React:**

```tsx
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: () => api('/campaign-service/api/v1/categories')
})
```

---

## 2.20 Categorie par ID

```
GET /campaign-service/api/v1/categories/{id}
```

**Auth:** Public

---

## 2.21 Supprimer une categorie (Admin)

```
DELETE /campaign-service/api/v1/categories/{id}
```

**Auth:** JWT | **Role:** ADMIN

**Response 204:** No Content

---

# 3. INVESTMENT SERVICE

## 3.1 Creer un investissement

```
POST /investment-service/api/investments
```

**Auth:** JWT | **Role:** INVESTOR

**Request:**

```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "paymentMethodCode": "STRIPE",
  "notes": "Investissement dans la ferme solaire"
}
```

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| campaignId | UUID | oui | ID campagne approuvee |
| amount | number | oui | min 1000 FCFA |
| paymentMethodCode | string | non | `STRIPE` (defaut), `ORANGE_MONEY`, `WAVE` |
| notes | string | non | Commentaire libre |

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campaignId": "uuid",
    "investorProfileId": "uuid",
    "amount": 50000,
    "status": "COMPLETED",
    "paymentMethod": "STRIPE",
    "notes": "...",
    "createdAt": "2026-02-10T22:17:28Z"
  }
}
```

**React:**

```tsx
const invest = useMutation({
  mutationFn: (data: { campaignId: string; amount: number }) =>
    api('/investment-service/api/investments', { method: 'POST', body: data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] })
  }
})
```

---

## 3.2 Mes investissements

```
GET /investment-service/api/investments/investor/{investorProfileId}?page=0&size=20
```

**Auth:** JWT | **Role:** INVESTOR ou ADMIN

---

## 3.3 Investissements d'une campagne

```
GET /investment-service/api/investments/campaign/{campaignId}?page=0&size=20
```

**Auth:** JWT | **Role:** BUSINESS ou ADMIN

---

## 3.4 Total investi dans une campagne

```
GET /investment-service/api/investments/campaign/{campaignId}/total
```

**Auth:** JWT

**Response 200:**

```json
{
  "success": true,
  "message": "Montant total recupere",
  "data": 2500000
}
```

---

## 3.5 Annuler un investissement

```
DELETE /investment-service/api/investments/{investmentId}?reason=Changement d'avis
```

**Auth:** JWT | **Role:** INVESTOR ou ADMIN

**Query param:** `reason` (optionnel)

---

## 3.6 Mon wallet

```
GET /investment-service/api/wallets/me
```

**Auth:** JWT | **Role:** INVESTOR ou BUSINESS

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ownerType": "INVESTOR",
    "ownerId": "uuid",
    "balance": 150000.00,
    "currency": "XOF",
    "status": "ACTIVE",
    "createdAt": "2026-02-10T22:17:28Z"
  }
}
```

**React:**

```tsx
const { data: wallet } = useQuery({
  queryKey: ['wallet'],
  queryFn: () => api('/investment-service/api/wallets/me')
})
```

---

## 3.7 Deposer de l'argent

```
POST /investment-service/api/wallets/me/deposit
```

**Auth:** JWT | **Role:** INVESTOR ou BUSINESS

**Request:**

```json
{
  "amount": 100000
}
```

**Response 201:** `DepositResponse` (contient URL Stripe Checkout)

---

## 3.8 Mes transactions

```
GET /investment-service/api/wallets/me/transactions?page=0&size=20
```

**Auth:** JWT | **Role:** INVESTOR ou BUSINESS

---

## 3.9 Wallet par owner

```
GET /investment-service/api/wallets/{ownerType}/{ownerId}
```

**Auth:** JWT | **Role:** INVESTOR, BUSINESS ou ADMIN

**ownerType values:** `INVESTOR`, `BUSINESS`, `ADMIN`

---

## 3.10 Transactions d'un wallet

```
GET /investment-service/api/wallets/{walletId}/transactions?page=0&size=20
```

**Auth:** JWT | **Role:** INVESTOR, BUSINESS ou ADMIN

---

## 3.11 Geler un wallet (Admin)

```
PUT /investment-service/api/wallets/{walletId}/freeze
```

**Auth:** JWT | **Role:** ADMIN

---

## 3.12 Activer un wallet (Admin)

```
PUT /investment-service/api/wallets/{walletId}/activate
```

**Auth:** JWT | **Role:** ADMIN

---

## 3.13 Creer une demande de retrait

```
POST /investment-service/api/withdrawals
```

**Auth:** JWT | **Role:** BUSINESS

**Headers supplementaires:**

```
X-Business-Profile-Id: uuid-du-profil-business
```

**Request:**

```json
{
  "amount": 500000
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessProfileId": "uuid",
    "amount": 500000,
    "status": "PENDING",
    "createdAt": "2026-02-10T22:17:28Z"
  }
}
```

---

## 3.14 Mes demandes de retrait

```
GET /investment-service/api/withdrawals/my-withdrawals?page=0&size=20
```

**Auth:** JWT | **Role:** BUSINESS

**Headers:** `X-Business-Profile-Id: uuid`

---

## 3.15 Detail d'une demande

```
GET /investment-service/api/withdrawals/{withdrawalId}
```

**Auth:** JWT | **Role:** BUSINESS ou ADMIN

---

## 3.16 Annuler une demande

```
DELETE /investment-service/api/withdrawals/{withdrawalId}
```

**Auth:** JWT | **Role:** BUSINESS

**Headers:** `X-Business-Profile-Id: uuid`

---

## 3.17 Demandes en attente (Admin)

```
GET /investment-service/api/withdrawals/pending?page=0&size=20
```

**Auth:** JWT | **Role:** ADMIN

---

## 3.18 Demandes par statut (Admin)

```
GET /investment-service/api/withdrawals/status/{status}?page=0&size=20
```

**Auth:** JWT | **Role:** ADMIN

**status values:** `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

---

## 3.19 Approuver un retrait (Admin)

```
PUT /investment-service/api/withdrawals/{withdrawalId}/approve
```

**Auth:** JWT | **Role:** ADMIN

**Headers:** `X-Admin-Id: uuid`

---

## 3.20 Rejeter un retrait (Admin)

```
PUT /investment-service/api/withdrawals/{withdrawalId}/reject
```

**Auth:** JWT | **Role:** ADMIN

**Headers:** `X-Admin-Id: uuid`

**Request:**

```json
{
  "reason": "Documents insuffisants"
}
```

---

# Enums Reference

## Roles

| Role | Description |
|------|-------------|
| `INVESTOR` | Investisseur |
| `BUSINESS` | Porteur de projet (entreprise) |
| `ADMIN` | Administrateur |

## CampaignStatus

| Status | Description |
|--------|-------------|
| `DRAFT` | Brouillon |
| `REVIEW` | En revision |
| `APPROVED` | Approuvee (disponible pour investissement) |
| `REJECTED` | Rejetee |
| `FUNDED` | Objectif atteint |
| `CLOSED` | Fermee |

## KYCLevel

| Level | Plafond investissement |
|-------|----------------------|
| `L0` | 0 FCFA (non verifie) |
| `L1` | 500 000 FCFA |
| `L2` | 5 000 000 FCFA |

## KYCDocumentType

`ID_CARD_FRONT`, `ID_CARD_BACK`, `PASSPORT`, `SELFIE`, `INCOME_PROOF`, `ADDRESS_PROOF`, `RCCM`, `NINEA`

## KYCStatus

`PENDING`, `APPROVED`, `REJECTED`

## InvestorType

`INDIVIDUAL`, `INSTITUTIONAL`

## LegalForm

`SARL`, `SA`, `SAS`, `SUARL`, `SNC`, `GIE`, `ASSOCIATION`, `OTHER`

## IncomeBracket

`LOW`, `MID`, `HIGH`, `VERY_HIGH`

## OwnerType (Wallet)

`INVESTOR`, `BUSINESS`, `ADMIN`

## WithdrawalStatus

`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

## OTPType

`EMAIL`, `SMS`, `WHATSAPP`

## VerificationStatus

`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`

---

# Swagger UI

Accessible a : `https://galsen-invest.online/swagger-ui.html`

Selectionnez le service dans le dropdown en haut pour voir ses endpoints.

---

**Total : 71 endpoints**

*Galsen Invest - Plateforme de financement participatif senegalaise*
