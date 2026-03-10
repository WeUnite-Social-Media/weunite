import type { AdminLogin, AdminLoginResponse } from "@/@types/admin/auth.types";
import { instance as axios } from "../../axios";
import { AxiosError } from "axios";

export const adminLoginRequest = async (credentials: AdminLogin) => {
  try {
    const response = await axios.post<AdminLoginResponse>(
      "/admin/auth/login",
      credentials,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.user ? "Login realizado com sucesso!" : null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao fazer login administrativo",
    };
  }
};

export const validateAdminTokenRequest = async () => {
  try {
    const response = await axios.get("/admin/auth/validate");
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
      error: error.response?.data?.message || "Token inválido",
    };
  }
};

export const refreshAdminTokenRequest = async () => {
  try {
    const response = await axios.post<AdminLoginResponse>(
      "/admin/auth/refresh",
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
      error: error.response?.data?.message || "Erro ao renovar token",
    };
  }
};
