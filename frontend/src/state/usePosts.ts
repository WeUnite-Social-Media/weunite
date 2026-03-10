import type { CreatePost, UpdatePost } from "@/@types/post.types";
import {
  createPostRequest,
  deletePostRequest,
  getPostsRequest,
  updatePostRequest,
} from "@/api/services/postService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreatePost; userId: number }) =>
      createPostRequest(data, userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Publicação criada com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao criar publicação");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao criar postagem");
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      userId,
      postId,
    }: {
      data: UpdatePost;
      userId: number;
      postId: number;
    }) => updatePostRequest(data, userId, postId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Publicação atualizada com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao atualizar publicação");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar postagem");
    },
  });
};

export const useGetPosts = () => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: getPostsRequest,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      postId,
    }: {
      userId: number;
      postId: number;
    }) => deletePostRequest(userId, postId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Publicação deletada com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao deletar publicação");
      }
  },
  onError: () => {
    toast.error("Erro inesperado ao deletar postagem");
  },
});

}
