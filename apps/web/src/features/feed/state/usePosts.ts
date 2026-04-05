import type { CreatePost, UpdatePost } from "@/shared/types/post.types";
import {
  createPostRequest,
  deletePostRequest,
  FEED_POSTS_PAGE_SIZE,
  getPostRequest,
  getPostsByUserRequest,
  getPostsRequest,
  updatePostRequest,
} from "@/features/feed/api/postService";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export const postDetailQueryOptions = (postId: number) => ({
  queryKey: postKeys.detail(String(postId)),
  queryFn: () => getPostRequest(postId),
  enabled: postId > 0,
  staleTime: 5 * 60 * 1000,
  retry: 2,
});

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreatePost; userId: number }) =>
      createPostRequest(data, userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Publicacao criada com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao criar publicacao");
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
        toast.success(result.message || "Publicacao atualizada com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao atualizar publicacao");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao atualizar postagem");
    },
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: postKeys.lists(),
    queryFn: ({ pageParam }) => getPostsRequest({ page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data) {
        return undefined;
      }

      return lastPage.data.length < FEED_POSTS_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useGetPost = (postId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    ...postDetailQueryOptions(postId),
    enabled: options?.enabled ?? postId > 0,
  });
};

export const useGetPostsByUser = (userId: number) => {
  return useQuery({
    queryKey: postKeys.list(`user-${userId}`),
    queryFn: () => getPostsByUserRequest(userId),
    enabled: userId > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: number; postId: number }) =>
      deletePostRequest(userId, postId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "Publicacao deletada com sucesso!");

        queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } else {
        toast.error(result.message || "Erro ao deletar publicacao");
      }
    },
    onError: () => {
      toast.error("Erro inesperado ao deletar postagem");
    },
  });
};
