import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateComment, UpdateComment } from "@/@types/comment.types";
import {
  createCommentRequest,
  deleteCommentRequest,
  getCommentsPostRequest,
  getCommentsUserId,
  updateCommentRequest,
} from "@/api/services/commentService";
import { toast } from "sonner";
import { postKeys } from "./usePosts";

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  listByPost: (postId: number) =>
    [...commentKeys.lists(), "post", postId] as const,
  listByUser: (userId: number) =>
    [...commentKeys.lists(), "user", userId] as const,
  listByComment: (commentId: number) =>
    [...commentKeys.lists(), "comment", commentId] as const,
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
      postId,
    }: {
      data: CreateComment;
      userId: number;
      postId: number;
    }) => createCommentRequest(data, userId, postId),
    onSuccess: (result, { postId, userId }) => {
      if (result.success) {
        toast.success(result.message || "Comentário criado com sucesso!");

        queryClient.invalidateQueries({
          queryKey: commentKeys.listByPost(postId),
        });

        queryClient.invalidateQueries({
          queryKey: commentKeys.listByUser(userId),
        });

        queryClient.invalidateQueries({
          queryKey: postKeys.lists(),
        });
      } else {
        toast.error(result.message || "Erro ao criar comentário.");
      }
    },

    onError: () => {
      toast.error("Erro inesperado ao criar comentário.");
    },
  });
};

export const useUpdateComments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
      commentId,
    }: {
      data: UpdateComment;
      userId: number;
      commentId: number;
      postId: number;
    }) => updateCommentRequest(data, userId, commentId),
    onSuccess: (result, { userId, postId }) => {
      if (result.success) {
        toast.success(result.message || "Comentário atualizado com sucesso!");

        queryClient.invalidateQueries({
          queryKey: commentKeys.listByPost(postId),
        });

        queryClient.invalidateQueries({
          queryKey: commentKeys.listByUser(userId),
        });
      } else {
        toast.error(result.message || "Erro ao atualizar comentário");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar postagem");
    },
  });
};

export const useGetComments = (postId: number) => {
  return useQuery({
    queryKey: commentKeys.listByPost(postId),
    queryFn: () => getCommentsPostRequest(postId),
    staleTime: 5 * 60 * 1000,
    enabled: !!postId,
  });
};
export const useGetCommentsByUserId = (userId: number) => {
  return useQuery({
    queryKey: commentKeys.listByUser(userId),
    queryFn: () => getCommentsUserId(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      commentId,
    }: {
      userId: number;
      commentId: number;
      postId: number;
    }) => deleteCommentRequest(userId, commentId),
    onSuccess: (result, { postId, userId }) => {
      if (result.success) {
        toast.success(result.message || "Comentário deletado com sucesso!");

        queryClient.invalidateQueries({
          queryKey: commentKeys.listByPost(postId),
        });

        queryClient.invalidateQueries({
          queryKey: commentKeys.listByUser(userId),
        });
      } else {
        toast.error(result.message || "Erro ao deletar comentário");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao deletar comentário");
    },
  });
};
