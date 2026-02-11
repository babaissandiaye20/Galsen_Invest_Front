/**
 * Types Investissement
 */

export interface Investment {
  id: string;
  campaignId: string;
  investorProfileId: string;
  amount: number;
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateInvestmentRequest {
  campaignId: string;
  amount: number;
  paymentMethodCode?: 'STRIPE' | 'ORANGE_MONEY' | 'WAVE';
  notes?: string;
}
