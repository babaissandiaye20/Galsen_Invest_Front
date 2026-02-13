/**
 * Types Utilisateur & KYC
 */

// ─── User (info de base dans les profils) ────────────────────────────────────

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  email_verified: boolean;
}

// ─── Investor Profile ────────────────────────────────────────────────────────

export interface InvestorProfile {
  id: string;
  odoo: string;
  investorType: 'INDIVIDUAL' | 'INSTITUTIONAL';
  firstName: string;
  lastName: string;
  birthDate: string | null;
  nationalityName: string | null;
  nationalityIsoCode: string | null;
  address: string | null;
  city: string | null;
  residenceCountryName: string | null;
  residenceCountryIsoCode: string | null;
  kycLevel: 'L0' | 'L1' | 'L2';
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  occupation: string | null;
  incomeBracket: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH' | null;
  pep: boolean;
  idIssuingCountryName: string | null;
  monthlyInvestmentCap: number | null;
  lifetimeInvestmentCap: number | null;
  totalInvested: number;
  remainingMonthlyCapacity: number | null;
  remainingLifetimeCapacity: number | null;
  bio: string | null;
  user: UserInfo;
}

export interface UpdateInvestorProfileRequest {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  type?: 'INDIVIDUAL' | 'INSTITUTIONAL';
  nationalityId?: string;
  residenceCountryId?: string;
  address?: string;
  city?: string;
  occupation?: string;
  incomeBracket?: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
  pep?: boolean;
  bio?: string;
}

// ─── Business Profile ────────────────────────────────────────────────────────

export interface BusinessProfile {
  id: string;
  userId: string;
  companyName: string;
  tradeName: string | null;
  legalForm: string;
  registrationNumber: string | null;
  taxId: string | null;
  foundedDate: string | null;
  representativeName: string | null;
  representativeTitle: string | null;
  sectorLibelle: string | null;
  description: string | null;
  websiteUrl: string | null;
  employeeCount: number | null;
  annualRevenue: number | null;
  address: string | null;
  city: string | null;
  countryName: string | null;
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  maxCampaignAmount: number | null;
  maxConcurrentCampaigns: number | null;
  totalRaised: number;
  user: UserInfo;
}

export interface UpdateBusinessProfileRequest {
  companyName?: string;
  tradeName?: string;
  legalForm?: string;
  registrationNumber?: string;
  taxId?: string;
  foundedDate?: string;
  representativeName?: string;
  representativeTitle?: string;
  sectorId?: string;
  description?: string;
  websiteUrl?: string;
  employeeCount?: number;
  annualRevenue?: number;
  address?: string;
  city?: string;
  countryId?: string;
}

// ─── KYC Documents ───────────────────────────────────────────────────────────

export type KycDocumentType =
  | 'ID_CARD_FRONT'
  | 'ID_CARD_BACK'
  | 'PASSPORT'
  | 'SELFIE'
  | 'INCOME_PROOF'
  | 'ADDRESS_PROOF'
  | 'RCCM'
  | 'NINEA';

export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycDocument {
  id: string;
  userId: string;
  type: KycDocumentType;
  fileUrl: string;
  publicId: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  status: KycStatus;
  rejectionReason: string | null;
  processedAt: string | null;
  createdAt: string;
  // Champs optionnels — le backend peut les inclure dans la réponse pending
  userName?: string;
  userEmail?: string;
}
