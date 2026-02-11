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

export interface DepositRequest {
  amount: number;
}

// ─── Withdrawals (Retraits) ──────────────────────────────────────────────────

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Withdrawal {
  id: string;
  businessProfileId: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
}

export interface RejectWithdrawalRequest {
  reason: string;
}
