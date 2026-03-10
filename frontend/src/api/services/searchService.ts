import { instance } from "../axios";
import { AxiosError } from "axios";
import type { User } from "@/@types/user.types";

export interface SearchUsersResponse {
  success: boolean;
  data: User[] | null;
  message: string | null;
  error: string | null;
}

export const searchUsers = async (
  query: string,
): Promise<SearchUsersResponse> => {
  try {
    const response = await instance.get(
      `/user/search?query=${encodeURIComponent(query)}`,
    );

    const userData = response.data.data || response.data.users || response.data;

    return {
      success: true,
      data: userData,
      message: response.data.message || "Usuários encontrados com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: [],
      message: null,
      error: error.response?.data?.message || "Erro ao buscar usuários",
    };
  }
};
