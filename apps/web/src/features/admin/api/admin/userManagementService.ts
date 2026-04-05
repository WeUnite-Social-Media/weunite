import { instance as axios } from "@/shared/api/http";
import type { AdminUserSummary } from "@/shared/types/admin.types";
import type { AxiosError } from "axios";

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

interface ModerationResponseBody {
  message: string;
  data?: string | null;
}

interface SuspendAdminUserRequest {
  userId: number;
  durationInDays: number;
  reason?: string;
  reportId?: number | null;
}

interface BanAdminUserRequest {
  userId: number;
  reason?: string;
}

interface ReactivateAdminUserRequest {
  userId: number;
}

export const getAdminUsersRequest = async (): Promise<
  ApiResponse<AdminUserSummary[]>
> => {
  try {
    const response = await axios.get<AdminUserSummary[]>("/admin/users");

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
      error: error.response?.data?.message || "Erro ao carregar usuarios",
    };
  }
};

export const suspendAdminUserRequest = async (
  payload: SuspendAdminUserRequest,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post<ModerationResponseBody>(
      "/admin/users/suspend",
      payload,
    );

    return {
      success: true,
      data: null,
      message: response.data.data || response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao suspender usuario",
    };
  }
};

export const banAdminUserRequest = async (
  payload: BanAdminUserRequest,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post<ModerationResponseBody>(
      "/admin/users/ban",
      payload,
    );

    return {
      success: true,
      data: null,
      message: response.data.data || response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao banir usuario",
    };
  }
};

export const reactivateAdminUserRequest = async (
  payload: ReactivateAdminUserRequest,
): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post<ModerationResponseBody>(
      "/admin/users/reactivate",
      payload,
    );

    return {
      success: true,
      data: null,
      message: response.data.data || response.data.message,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao reativar usuario",
    };
  }
};
