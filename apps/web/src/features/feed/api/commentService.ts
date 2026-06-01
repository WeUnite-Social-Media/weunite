import { instance as axios } from "@/shared/api/http";
import type {
  CreateComment,
  UpdateComment,
} from "@/shared/types/comment.types";
import { AxiosError } from "axios";

export const COMMENTS_PAGE_SIZE = 10;

interface GetCommentsRequestParams {
  page?: number;
  size?: number;
}

export const createCommentRequest = async (
  data: CreateComment,
  userId: number,
  postId: number,
) => {
  try {
    const response = await axios.post(
      `/comment/create?userId=${userId}&postId=${postId}`,
      {
        text: data.text,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Comentário criado com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: error.response?.data.message || "Erro ao criar comentário",
      error,
    };
  }
};

export const updateCommentRequest = async (
  data: UpdateComment,
  userId: number,
  commentId: number,
) => {
  try {
    const formData = new FormData();
    const commentBlob = new Blob([JSON.stringify({ text: data.text })], {
      type: "application/json",
    });

    formData.append("comment", commentBlob);

    if (data.media) {
      formData.append("image", data.media);
    }

    const response = await axios.put(
      `/comment/update/${userId}/${commentId}`,
      formData,
    );

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Comentário atualizado com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao atualizar comentário",
    };
  }
};

export const getCommentsPostRequest = async (
  postId: number,
  { page = 0, size = COMMENTS_PAGE_SIZE }: GetCommentsRequestParams = {},
) => {
  try {
    const response = await axios.get(`/comment/get/${postId}`, {
      params: {
        page,
        size,
      },
    });

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Comentários consultados com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao consultar comentários",
    };
  }
};

export const getCommentsUserId = async (
  userId: number,
  { page = 0, size = COMMENTS_PAGE_SIZE }: GetCommentsRequestParams = {},
) => {
  try {
    const response = await axios.get(`/comment/get/user/${userId}`, {
      params: {
        page,
        size,
      },
    });

    return {
      success: true,
      data: response.data,
      message:
        response.data.message ||
        "Comentários do usuário consultados com sucesso!",
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
        "Erro ao consultar comentários do usuário",
    };
  }
};

export const deleteCommentRequest = async (
  userId: number,
  commentId: number,
) => {
  try {
    const response = await axios.delete(
      `/comment/delete/${userId}/${commentId}`,
    );

    return {
      success: true,
      message: response.data.message || "Comentário deletado com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao deletar comentário",
    };
  }
};
