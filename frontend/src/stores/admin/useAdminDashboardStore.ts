import {
  getDashboardStatsRequest,
  getMonthlyActivityRequest,
  getOpportunitiesByCategoryRequest,
} from "@/api/services/admin/dashboardService";
import type {
  DashboardData,
  MonthlyActivity,
  OpportunityByCategory,
} from "@/@types/admin/dashboard.types";
import { create } from "zustand";

interface DashboardState {
  dashboardData: DashboardData | null;
  monthlyActivity: MonthlyActivity[];
  opportunitiesByCategory: OpportunityByCategory[];
  loading: boolean;
  error: string | null;
}

interface DashboardActions {
  loadDashboardStats: () => Promise<void>;
  loadMonthlyActivity: (months?: number) => Promise<void>;
  loadOpportunitiesByCategory: () => Promise<void>;
  clearError: () => void;
}

export const useAdminDashboardStore = create<DashboardState & DashboardActions>(
  (set) => ({
    dashboardData: null,
    monthlyActivity: [],
    opportunitiesByCategory: [],
    loading: false,
    error: null,

    loadDashboardStats: async () => {
      set({ loading: true, error: null });

      const result = await getDashboardStatsRequest();

      if (result.success && result.data) {
        set({ dashboardData: result.data, loading: false });
      } else {
        set({ error: result.error, loading: false });
      }
    },

    loadMonthlyActivity: async (months = 6) => {
      set({ loading: true, error: null });

      const result = await getMonthlyActivityRequest(months);

      if (result.success && result.data) {
        set({ monthlyActivity: result.data, loading: false });
      } else {
        set({ error: result.error, loading: false });
      }
    },

    loadOpportunitiesByCategory: async () => {
      set({ loading: true, error: null });

      const result = await getOpportunitiesByCategoryRequest();

      if (result.success && result.data) {
        set({ opportunitiesByCategory: result.data, loading: false });
      } else {
        set({ error: result.error, loading: false });
      }
    },

    clearError: () => set({ error: null }),
  }),
);
