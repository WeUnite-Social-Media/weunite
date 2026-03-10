import type { DashboardData } from "@/@types/admin/dashboard.types";
import { instance as axios } from "../../axios";
import { AxiosError } from "axios";

export const getDashboardStatsRequest = async () => {
  try {
    const response = await axios.get<DashboardData>("/admin/dashboard/stats");
    return {
      success: true,
      data: response.data,
      message: null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message ||
        "Erro ao carregar estatísticas do dashboard",
    };
  }
};

export const getMonthlyActivityRequest = async (months: number = 6) => {
  try {
    const response = await axios.get(
      `/admin/dashboard/activity?months=${months}`,
    );
    return {
      success: true,
      data: response.data,
      message: null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao carregar atividade mensal",
    };
  }
};

export const getOpportunitiesByCategoryRequest = async () => {
  try {
    const response = await axios.get(
      "/admin/dashboard/opportunities-by-category",
    );
    return {
      success: true,
      data: response.data,
      message: null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message ||
        "Erro ao carregar oportunidades por categoria",
    };
  }
};
