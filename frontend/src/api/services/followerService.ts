import type {
  FollowAndUnfollow,
  GetFollowers,
  GetFollowing,
  GetFollow,
} from "@/@types/follower.type";
import { instance as axios } from "../axios";
import { AxiosError } from "axios";

export const followAndUnfollowRequest = async (data: FollowAndUnfollow) => {
  try {
    const response = await axios.post(
      `/follow/followAndUnfollow/${data.followerId}/${data.followedId}`,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Sucesso ao Seguir ou deixar de Seguir",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error:
        error.response?.data.message || "Erro ao seguir ou deixar de seguir",
    };
  }
};

export const getFollowersRequest = async (data: GetFollowers) => {
  try {
    const response = await axios.get(`/follow/followers/${data.id}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Seguidores consultados com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data.message || "Erro ao consultar seguidores",
    };
  }
};

export const getFollowingRequest = async (data: GetFollowing) => {
  try {
    const response = await axios.get(`/follow/following/${data.id}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Seguindo consultados com sucesso!",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data.message || "Erro ao consultar seguindo",
    };
  }
};

export const getFollowRequest = async (data: GetFollow) => {
  try {
    const response = await axios.get(
      `/follow/get/${data.followerId}/${data.followedId}`,
    );
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Follow consultado com sucesso",
      error: null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return {
      success: false,
      data: null,
      message: null,
      error: error.response?.data.message || "Erro ao consultar follow",
    };
  }
};
