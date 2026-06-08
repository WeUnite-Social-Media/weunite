import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  COMMENTS_PAGE_SIZE,
  createCommentRequest,
  deleteCommentRequest,
  getCommentsPostRequest,
  getCommentsUserId,
  updateCommentRequest,
} from "@/features/feed/api/commentService";
import { postKeys } from "@/features/feed/state/usePosts";
import type {
  CreateComment,
  UpdateComment,
} from "@/shared/types/comment.types";

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
  return useInfiniteQuery({
    queryKey: commentKeys.listByPost(postId),
    queryFn: ({ pageParam }) =>
      getCommentsPostRequest(postId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      const loadedFullPage = lastPage.data.content.length >= COMMENTS_PAGE_SIZE;

      return lastPage.data.hasNext || loadedFullPage
        ? lastPage.data.page + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!postId,
  });
};

export const useGetCommentsByUserId = (userId: number) => {
  return useInfiniteQuery({
    queryKey: commentKeys.listByUser(userId),
    queryFn: ({ pageParam }) => getCommentsUserId(userId, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < COMMENTS_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
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
