/**
 * Types Campagne & Catégorie
 */

// ─── Campaign ────────────────────────────────────────────────────────────────

export type CampaignStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'FUNDED' | 'CLOSED';

export interface Campaign {
  id: string;
  businessProfileId: string;
  categoryId: string;
  categoryLibelle: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  devise: string;
  fundingPercentage: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface CreateCampaignRequest {
  categoryId: string;
  title: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  coverImage?: File;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface ChangeStatusRequest {
  status: CampaignStatus;
  reason?: string | null;
}

export interface RejectCampaignRequest {
  rejectionReason: string;
}

// ─── Campaign Photos ─────────────────────────────────────────────────────────

export interface CampaignPhoto {
  id: string;
  url: string;
  position: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  libelle: string;
  description: string;
}

export interface CreateCategoryRequest {
  libelle: string;
  description: string;
}
