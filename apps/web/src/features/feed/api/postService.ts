import type { CreatePost, Post, UpdatePost } from "@/shared/types/post.types";
import { instance as axios } from "@/shared/api/http";
import { AxiosError } from "axios";

export const FEED_POSTS_PAGE_SIZE = 20;

interface GetPostsRequestParams {
  page?: number;
  size?: number;
}

export const createPostRequest = async (data: CreatePost, userId: number) => {
  try {
    const formData = new FormData();

    const postBlob = new Blob([JSON.stringify({ text: data.text })], {
      type: "application/json",
    });

    formData.append("post", postBlob);

    if (data.media) {
      formData.append("image", data.media);
    }

    const response = await axios.post(`/posts/create/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Publicacao criada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao criar publicacao",
    };
  }
};

export const updatePostRequest = async (
  data: UpdatePost,
  userId: number,
  postId: number,
) => {
  try {
    const formData = new FormData();

    const postBlob = new Blob([JSON.stringify({ text: data.text })], {
      type: "application/json",
    });

    formData.append("post", postBlob);

    if (data.media) {
      formData.append("image", data.media);
    }

    const response = await axios.put(
      `/posts/update/${userId}/${postId}`,
      formData,
    );

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Publicacao atualizada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao atualizar publicacao",
    };
  }
};

export const getPostRequest = async (postId: number) => {
  try {
    const response = await axios.get(`/posts/get/${postId}`);

    return {
      success: true,
      data: response.data.data as Post,
      message: response.data.message || "Publicacao consultada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao consultar publicacao",
    };
  }
};

export const getPostsRequest = async ({
  page = 0,
  size = FEED_POSTS_PAGE_SIZE,
}: GetPostsRequestParams = {}) => {
  try {
    const response = await axios.get(`/posts/get`, {
      params: {
        page,
        size,
      },
    });

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Publicacoes consultadas com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao consultar publicacoes",
    };
  }
};

export const getPostsByUserRequest = async (userId: number) => {
  try {
    const response = await axios.get(`/posts/get/user/${userId}`, {
      params: {
        page: 0,
        size: 50,
      },
    });

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Publicacoes consultadas com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao consultar publicacoes",
    };
  }
};

export const deletePostRequest = async (userId: number, postId: number) => {
  try {
    const response = await axios.delete(`/posts/delete/${userId}/${postId}`);

    return {
      success: true,
      message: response.data.message || "Publicacao deletada com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Erro ao deletar publicacao",
    };
  }
};
