import { instance as axios } from "../axios";
import type { AxiosError } from "axios";
import type {
  ReportedPost,
  ReportedOpportunity,
  ReportSummary,
} from "@/@types/admin.types";

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

/**
 * Busca resumo dos posts denunciados (apenas IDs e contagem)
 */
export const getReportedPostsSummaryRequest = async (): Promise<
  ApiResponse<ReportSummary[]>
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
 * Busca detalhes completos dos posts denunciados
 */
export const getReportedPostsDetailsRequest = async (): Promise<
  ApiResponse<ReportedPost[]>
> => {
  try {
    const response = await axios.get("/admin/posts/reported/details");

    return {
      success: true,
      data: response.data,
      message: "Detalhes dos posts denunciados carregados com sucesso",
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
        "Erro ao carregar detalhes dos posts denunciados",
    };
  }
};

/**
 * Busca detalhes de um post denunciado específico
 */
export const getReportedPostDetailRequest = async (
  postId: number,
): Promise<ApiResponse<ReportedPost>> => {
  try {
    const response = await axios.get(`/admin/posts/reported/${postId}`);

    return {
      success: true,
      data: response.data,
      message: "Detalhes do post carregados com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data?.message || "Erro ao carregar detalhes do post",
    };
  }
};

/**
 * Busca resumo das oportunidades denunciadas (apenas IDs e contagem)
 */
export const getReportedOpportunitiesSummaryRequest = async (): Promise<
  ApiResponse<ReportSummary[]>
> => {
  try {
    const response = await axios.get("/admin/opportunities/reported");

    return {
      success: true,
      data: response.data,
      message: "Oportunidades denunciadas carregadas com sucesso",
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
        "Erro ao carregar oportunidades denunciadas",
    };
  }
};

/**
 * Busca detalhes completos das oportunidades denunciadas
 */
export const getReportedOpportunitiesDetailsRequest = async (): Promise<
  ApiResponse<ReportedOpportunity[]>
> => {
  try {
    const response = await axios.get("/admin/opportunities/reported/details");

    return {
      success: true,
      data: response.data,
      message: "Detalhes das oportunidades denunciadas carregadas com sucesso",
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
        "Erro ao carregar detalhes das oportunidades denunciadas",
    };
  }
};

/**
 * Busca detalhes de uma oportunidade denunciada específica
 */
export const getReportedOpportunityDetailRequest = async (
  opportunityId: number,
): Promise<ApiResponse<ReportedOpportunity>> => {
  try {
    const response = await axios.get(
      `/admin/opportunities/reported/${opportunityId}`,
    );

    return {
      success: true,
      data: response.data,
      message: "Detalhes da oportunidade carregados com sucesso",
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
        "Erro ao carregar detalhes da oportunidade",
    };
  }
};

/**
 * Deleta um post denunciado
 */
export const deletePostByAdminRequest = async (
  postId: number,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(`/admin/posts/${postId}`);

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
 * Deleta uma oportunidade denunciada
 */
export const deleteOpportunityByAdminRequest = async (
  opportunityId: number,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(
      `/admin/opportunities/${opportunityId}`,
    );

    return {
      success: true,
      data: null,
      message: response.data.message || "Oportunidade deletada com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao deletar oportunidade",
    };
  }
};

/**
 * Descarta denúncias de uma entidade (post ou oportunidade)
 */
export const dismissReportsRequest = async (
  entityId: number,
  type: "POST" | "OPPORTUNITY",
): Promise<ApiResponse<string>> => {
  try {
    const response = await axios.put(
      `/admin/reports/dismiss/${entityId}/${type}`,
    );

    return {
      success: true,
      data: response.data.data || response.data.message,
      message: response.data.message || "Denúncias descartadas com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao descartar denúncias",
    };
  }
};

/**
 * Marca denúncias como revisadas (em análise)
 */
export const markReportsAsReviewedRequest = async (
  entityId: number,
  type: "POST" | "OPPORTUNITY",
): Promise<ApiResponse<string>> => {
  try {
    const response = await axios.put(
      `/admin/reports/review/${entityId}/${type}`,
    );

    return {
      success: true,
      data: response.data.data || response.data.message,
      message: response.data.message || "Denúncias marcadas como revisadas",
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
        "Erro ao marcar denúncias como revisadas",
    };
  }
};

/**
 * Resolve denúncias (mantém o conteúdo e marca como resolvido)
 */
export const resolveReportsRequest = async (
  entityId: number,
  type: "POST" | "OPPORTUNITY",
): Promise<ApiResponse<string>> => {
  try {
    const response = await axios.put(
      `/admin/reports/resolve/${entityId}/${type}`,
    );

    return {
      success: true,
      data: response.data.data || response.data.message,
      message: response.data.message || "Denúncias resolvidas com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao resolver denúncias",
    };
  }
};
