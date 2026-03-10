import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

export const instance = axios.create({
  baseURL: "/api",
});

// Interceptor para adicionar o token JWT em todas as requisições
instance.interceptors.request.use((config) => {
  const jwt = useAuthStore.getState().jwt;
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

// Interceptor para lidar com token expirado
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 (Unauthorized) e não for uma tentativa de login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      console.log("⚠️ Token expirado, fazendo logout...");

      // Limpa o token e faz logout
      useAuthStore.getState().logout();

      // Redireciona para login
      window.location.href = "/auth/login";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
