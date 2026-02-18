/**
 * Types pour la gestion admin des utilisateurs
 */

export interface AdminUserProfile {
  profile_id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  representative_name?: string;
  city?: string;
  verification_status: string;
}

export interface AdminUser {
  id: string;
  keycloak_id: string;
  email: string;
  phone: string;
  role: 'investor' | 'business';
  status: 'ACTIVE' | 'PENDING_ACTIVATION' | 'SUSPENDED';
  display_name?: string;
  profile?: AdminUserProfile;
  last_login_at?: string;
  created_at: string;
}

export interface UpdateUserStatusRequest {
  enabled: boolean;
}

export interface CampaignStats {
  totalCampaigns: number;
  campaignsByStatus: Record<string, number>;
  totalRaisedAmount: number;
  totalTargetAmount: number;
  averageSuccessRate: number;
  fullyFundedCampaigns: number;
  activeCampaigns: number;
  campaignsByCategory: Record<string, number>;
}

export interface InvestmentStats {
  totalInvestments: number;
  totalAmountInvested: number;
  averageInvestmentAmount: number;
  uniqueInvestors: number;
  campaignsWithInvestments: number;
  minInvestment: number;
  maxInvestment: number;
  pendingInvestments: number;
  failedInvestments: number;
}
