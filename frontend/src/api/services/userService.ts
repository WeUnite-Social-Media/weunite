import type { UpdateUser, User } from "@/@types/user.types";
import { instance as axios } from "../axios";
import { AxiosError } from "axios";

export const updateUser = async (data: UpdateUser, username: string) => {
  try {
    const formData = new FormData();

    const postBlob = new Blob(
      [
        JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
        }),
      ],
      {
        type: "application/json",
      },
    );

    formData.append("user", postBlob);

    if (data.profileImg) {
      formData.append("profileImage", data.profileImg);
    }

    if (data.bannerImg) {
      formData.append("bannerImage", data.bannerImg);
    }

    const response = await axios.put(`/user/update/${username}`, formData);

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Perfil atualizado com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message,
    };
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const response = await axios.get(`/user/username/${username}`);

    const userData = response.data.data || response.data;

    return {
      success: true,
      data: userData as User,
      message: response.data.message || null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    console.error("Erro ao buscar usuário:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      username: username,
    });

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Usuário não encontrado",
    };
  }
};

export const getUserById = async (userId: number) => {
  try {
    const response = await axios.get(`/user/id/${userId}`);

    const userData = response.data.data || response.data;

    return {
      success: true,
      data: userData as User,
      message: response.data.message || null,
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message || "Usuário não encontrado",
    };
  }
};

export const deleteBannerUser = async (username: string) => {
  try {
    const response = await axios.delete(`/user/banner/delete/${username}`);

    return {
      success: true,
      data: response.data,
      message: response.data.message || "Banner deletado com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;

    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data?.message,
    };
  }
};
