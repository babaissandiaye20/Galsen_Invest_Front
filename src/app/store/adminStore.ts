/**
 * Store admin — gestion des utilisateurs (Zustand)
 */
import { create } from 'zustand';
import { adminService } from '../services/adminService';
import { extractErrorMessage } from '../services/httpClient';
import type { PaginatedData, PaginationParams } from '../models';
import type { AdminUser, CampaignStats, InvestmentStats } from '../models/admin.model';

interface AdminState {
  users: AdminUser[];
  pagination: Omit<PaginatedData<unknown>, 'content'> | null;
  loading: boolean;
  error: string | null;
  togglingId: string | null;

  campaignStats: CampaignStats | null;
  investmentStats: InvestmentStats | null;
  statsLoading: boolean;

  fetchUsers: (params?: PaginationParams) => Promise<void>;
  toggleUserStatus: (userId: string, currentlyEnabled: boolean) => Promise<void>;
  fetchCampaignStats: () => Promise<void>;
  fetchInvestmentStats: () => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  users: [],
  pagination: null,
  loading: false,
  error: null,
  togglingId: null,

  campaignStats: null,
  investmentStats: null,
  statsLoading: false,

  fetchUsers: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await adminService.getUsers(params);
      const { content, ...paginationInfo } = res.data;
      set({ users: content, pagination: paginationInfo, loading: false });
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err, 'Erreur lors du chargement des utilisateurs'), loading: false });
    }
  },

  toggleUserStatus: async (userId, currentlyEnabled) => {
    set({ togglingId: userId });
    try {
      await adminService.updateUserStatus(userId, { enabled: !currentlyEnabled });
      // Mettre à jour localement le statut
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId
            ? { ...u, status: currentlyEnabled ? 'SUSPENDED' : 'ACTIVE' }
            : u
        ),
        togglingId: null,
      }));
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err, 'Erreur lors du changement de statut'), togglingId: null });
      throw err;
    }
  },

  fetchCampaignStats: async () => {
    set({ statsLoading: true });
    try {
      const res = await adminService.getCampaignStats();
      set({ campaignStats: res.data, statsLoading: false });
    } catch (err: unknown) {
      set({ error: extractErrorMessage(err, 'Erreur lors du chargement des statistiques'), statsLoading: false });
    }
  },

  fetchInvestmentStats: async () => {
    try {
      const res = await adminService.getInvestmentStats();
      set({ investmentStats: res.data });
    } catch (err: unknown) {
      console.error('Erreur stats investissements:', err);
    }
  },

  clearError: () => set({ error: null }),
}));
