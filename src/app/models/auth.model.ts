/**
 * Types Authentification & OTP
 */

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  id_token: string;
  session_state: string;
  scope: string;
}

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'investor' | 'business';
}

export interface RegisterInvestorRequest {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  investorType?: 'INDIVIDUAL' | 'INSTITUTIONAL';
  nationalityIsoCode?: string;
  residenceCountryIsoCode?: string;
  city?: string;
  address?: string;
  occupation?: string;
  incomeBracket?: 'LOW' | 'MID' | 'HIGH' | 'VERY_HIGH';
  isPep?: boolean;
}

export interface RegisterBusinessRequest {
  email: string;
  password: string;
  phone: string;
  companyName: string;
  legalForm: 'SARL' | 'SA' | 'SAS' | 'SUARL' | 'SNC' | 'GIE' | 'ASSOCIATION' | 'OTHER';
  sectorId: string;
  tradeName?: string;
  registrationNumber?: string;
  taxId?: string;
  foundedDate?: string;
  representativeName?: string;
  representativeTitle?: string;
  countryIsoCode?: string;
  address?: string;
  city?: string;
  websiteUrl?: string;
  description?: string;
  employeeCount?: number;
  annualRevenue?: number;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
  email_verified: boolean;
  roles: string[];
  created_at: string;
  message: string;
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export type OtpChannel = 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface OtpSendRequest {
  email: string;
  type: OtpChannel;
}

export interface OtpSendResponse {
  sent: boolean;
  message: string;
  expiresAt: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  message: string;
  email?: string;
  userStatus?: string;
  attemptsRemaining?: number;
}

// ─── Forgot Password ────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}
