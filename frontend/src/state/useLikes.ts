import type { ToggleLike, ToggleLikeComment } from "@/@types/like.types";
import {
  toggleLikeRequest,
  toggleLikeRequestComment,
  getCommentLikes,
} from "@/api/services/likeService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postKeys } from "./usePosts";
import { toast } from "sonner";
import { commentKeys } from "./useComments";

export const likeKeys = {
  all: ["likes"] as const,
  lists: () => [...likeKeys.all, "list"] as const,
  list: (filters: string) => [...likeKeys.lists(), { filters }] as const,
  details: () => [...likeKeys.all, "detail"] as const,
  detail: (id: string) => [...likeKeys.details(), id] as const,
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleLike) => toggleLikeRequest(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Like atualizado com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });

        queryClient.invalidateQueries({ queryKey: likeKeys.lists() });
      } else {
        toast.error(result.error || "Erro ao atualizar like");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar like");
    },
  });
};

export const useToggleLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleLikeComment) => toggleLikeRequestComment(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(result.message || "Like atualizado com sucesso!");

        queryClient.invalidateQueries({ queryKey: commentKeys.all });

        queryClient.invalidateQueries({
          queryKey: [...likeKeys.all, "comment", variables.commentId],
        });

        queryClient.invalidateQueries({ queryKey: likeKeys.lists() });
      } else {
        toast.error(result.error || "Erro ao atualizar like");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar like");
    },
  });
};

export const useCommentLikes = (commentId: number) => {
  return useQuery({
    queryKey: [...likeKeys.all, "comment", commentId],
    queryFn: () => getCommentLikes(commentId),
    staleTime: 1000 * 10 * 1,
  });
};
