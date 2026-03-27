import type { UpdateUser } from "@/shared/types/user.types";
import {
  deleteBannerUser,
  updateUser,
} from "@/features/profile/api/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { postKeys } from "@/features/feed/state/usePosts";
import { commentKeys } from "@/features/feed/state/useComments";
import { normalizeUser } from "@/shared/lib/normalizeUser";

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
        const updatedUser = normalizeUser(result.data?.data);

        if (user && updatedUser) {
          setUser({
            ...user,
            ...updatedUser,
          });
        }

        queryClient.invalidateQueries({
          queryKey: profileKeys.detailByUsername(user?.username || ""),
        });
        queryClient.invalidateQueries({
          queryKey: profileKeys.detailByUsername(updatedUser?.username || ""),
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
        const updatedUser = normalizeUser(result.data?.data);

        if (user && updatedUser) {
          setUser({
            ...user,
            ...updatedUser,
          });
        }

        queryClient.invalidateQueries({
          queryKey: profileKeys.detailByUsername(user?.username || ""),
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
