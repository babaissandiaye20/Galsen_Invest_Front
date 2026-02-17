/**
 * Types Wallet, Transactions & Retraits
 */

// ─── Wallet ──────────────────────────────────────────────────────────────────

export type OwnerType = 'INVESTOR' | 'BUSINESS' | 'ADMIN';

export interface Wallet {
  id: string;
  ownerType: OwnerType;
  ownerId: string;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN';
  createdAt: string;
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'RETURN' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  reference: string;
  createdAt: string;
}

// ─── Deposit ─────────────────────────────────────────────────────────────────

export type PaymentMethodCode = 'STRIPE' | 'WAVE' | 'ORANGE_MONEY';

export interface DepositRequest {
  amount: number;
  paymentMethodCode: PaymentMethodCode;
}

export interface DepositSession {
  transactionId: string | null;
  sessionId: string;
  sessionReference: string;
  checkoutUrl: string | null;
  clientSecret: string;
  stripePublicKey: string;
  amount: number;
  currency: string;
  message: string;
}

// ─── Withdrawals (Retraits) ──────────────────────────────────────────────────

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'REJECTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type WithdrawalMethod = 'BANK_TRANSFER' | 'MOBILE_MONEY';

export interface Withdrawal {
  id: string;
  walletId: string;
  businessProfileId: string;
  amount: number;
  currency: string;
  withdrawalMethod: WithdrawalMethod;
  paymentDetails: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  completedAt?: string;
  transferReference?: string;
  stripePayoutId?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  withdrawalMethod: WithdrawalMethod;
  paymentDetails: string;
  notes?: string;
}

export interface RejectWithdrawalRequest {
  reason: string;
}
