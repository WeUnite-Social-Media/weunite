import { instance as axios } from "@/api/axios";
import type { AxiosError } from "axios";
import type { ModerationAction, ReportedPost } from "@/@types/admin.types";

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

/**
 * Busca todos os posts denunciados
 */
export const getReportedPostsRequest = async (): Promise<
  ApiResponse<ReportedPost[]>
> => {
  try {
    const response = await axios.get("/admin/posts/reported");

    return {
      success: true,
      data: response.data,
      message: "Posts denunciados carregados com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao carregar posts denunciados",
    };
  }
};

/**
 * Oculta um post denunciado
 */
export const hidePostRequest = async (
  postId: string,
  reason?: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(`/admin/posts/${postId}/hide`, {
      reason,
    });

    return {
      success: true,
      data: null,
      message: response.data.message || "Post ocultado com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao ocultar post",
    };
  }
};

/**
 * Deleta um post denunciado
 */
export const deletePostRequest = async (
  postId: string,
  reason?: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(`/admin/posts/${postId}`, {
      data: { reason },
    });

    return {
      success: true,
      data: null,
      message: response.data.message || "Post deletado com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao deletar post",
    };
  }
};

/**
 * Dismisses (rejeita) uma denúncia de post
 */
export const dismissReportRequest = async (
  postId: string,
  reason?: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(`/admin/posts/${postId}/dismiss`, {
      reason,
    });

    return {
      success: true,
      data: null,
      message: response.data.message || "Denúncia rejeitada com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao rejeitar denúncia",
    };
  }
};

/**
 * Executa uma ação de moderação em um post
 */
export const moderatePostRequest = async (
  action: ModerationAction,
): Promise<ApiResponse<void>> => {
  switch (action.action) {
    case "hide":
      return hidePostRequest(action.postId, action.reason);
    case "delete":
      return deletePostRequest(action.postId, action.reason);
    case "dismiss":
      return dismissReportRequest(action.postId, action.reason);
    default:
      return {
        success: false,
        data: null,
        message: null,
        error: "Ação de moderação inválida",
      };
  }
};
