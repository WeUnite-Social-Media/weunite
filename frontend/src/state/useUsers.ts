import type { UpdateUser } from "@/@types/user.types";
import { deleteBannerUser, updateUser } from "@/api/services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { postKeys } from "./usePosts";
import { commentKeys } from "./useComments";

export const profileKeys = {
  all: ["profiles"] as const,
  lists: () => [...profileKeys.all, "list"] as const,
  listByUser: (userId: number) => [...profileKeys.lists(), { userId }] as const,
  listByPostId: (postId: number) =>
    [...profileKeys.lists(), { postId }] as const,
  detailByUsername: (username: string) =>
    [...profileKeys.all, "detail", username] as const,
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: ({
      data,
      username,
    }: {
      data: UpdateUser;
      username: string;
    }) => {
      return updateUser(data, username);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Perfil atualizado com sucesso!");

        if (user && result.data?.data) {
          setUser({
            ...user,
            name: result.data.data.name || user.name,
            username: result.data.data.username || user.username,
            profileImg: result.data.data.profileImg || user.profileImg,
            bannerImg: result.data.data.bannerImg || user.bannerImg,
          });
        }

        queryClient.invalidateQueries({
          queryKey: ["user-profile", user?.username],
        });
        queryClient.invalidateQueries({
          queryKey: profileKeys.listByUser(result.data.data.userId),
        });
        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
        queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      } else {
        toast.error(result?.error || "Erro ao atualizar perfil");
      }
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Erro inesperado ao atualizar perfil";
      toast.error(errorMessage);
    },
  });
};
export const useDeleteProfileBanner = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (username: string) => deleteBannerUser(username),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Banner deletado com sucesso!");

        if (user && result.data?.data) {
          setUser({
            ...user,
            bannerImg: result.data.bannerImg ?? null,
          });
        }

        queryClient.invalidateQueries({
          queryKey: ["user-profile", user?.username],
        });
      } else {
        toast.error(result?.error || "Erro ao deletar banner");
      }
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Erro inesperado ao deletar banner";
      toast.error(errorMessage);
    },
  });
};
