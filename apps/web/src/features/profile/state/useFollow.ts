import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  FOLLOW_PAGE_SIZE,
  followAndUnfollowRequest,
  getFollowersCountRequest,
  getFollowersRequest,
  getFollowingCountRequest,
  getFollowingRequest,
  getFollowRequest,
} from "@/features/profile/api/followerService";
import { toast } from "sonner";
import type { Follower } from "@/shared/types/follower.type";

export const followKeys = {
  all: ["follows"] as const,
  lists: () => [...followKeys.all, "list"] as const,
  followers: (userId: number) =>
    [...followKeys.lists(), "followers", userId] as const,
  following: (userId: number) =>
    [...followKeys.lists(), "following", userId] as const,
  followersCount: (userId: number) =>
    [...followKeys.all, "count", "followers", userId] as const,
  followingCount: (userId: number) =>
    [...followKeys.all, "count", "following", userId] as const,
  detail: (followerId: number, followedId: number) =>
    [...followKeys.all, "detail", followerId, followedId] as const,
};

export const useFollowAndUnfollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followerId,
      followedId,
    }: {
      followerId: number;
      followedId: number;
    }) => followAndUnfollowRequest({ followerId, followedId }),
    onSuccess: (result, { followedId, followerId }) => {
      if (result.success) {
        toast.success(result.message);
        const isNowFollowing = result.message?.includes("Seguiu");

        queryClient.setQueryData(
          followKeys.detail(followerId, followedId),
          isNowFollowing
            ? {
                success: true,
                data: result.data?.data ?? null,
                message: result.message,
                error: null,
              }
            : {
                success: false,
                data: null,
                message: null,
                error: null,
              },
        );

        queryClient.setQueriesData(
          { queryKey: followKeys.followers(followedId) },
          (oldData: unknown) =>
            updateFollowStatusInInfiniteData(
              oldData,
              followerId,
              isNowFollowing,
            ),
        );
        queryClient.setQueriesData(
          { queryKey: followKeys.following(followerId) },
          (oldData: unknown) =>
            updateFollowStatusInInfiniteData(
              oldData,
              followedId,
              isNowFollowing,
            ),
        );

        queryClient.invalidateQueries({
          queryKey: followKeys.followers(followedId),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.followersCount(followedId),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.following(followerId),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.followingCount(followerId),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.detail(followerId, followedId),
        });
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Erro enquanto seguia ou deixava de seguir");
    },
  });
};

function updateFollowStatusInInfiniteData(
  oldData: unknown,
  userId: number,
  isFollowing: boolean,
) {
  if (!oldData || typeof oldData !== "object" || !("pages" in oldData)) {
    return oldData;
  }

  const data = oldData as {
    pages: Array<{
      data?: {
        data?: Follower[];
      };
    }>;
  };

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data
        ? {
            ...page.data,
            data: page.data.data?.map((follow) => {
              const followerId = Number(follow.follower?.id);
              const followedId = Number(follow.followed?.id);
              const matches = followerId === userId || followedId === userId;

              return matches
                ? {
                    ...follow,
                    status: isFollowing ? "ACCEPTED" : "REMOVED",
                  }
                : follow;
            }),
          }
        : page.data,
    })),
  };
}

export const useGetFollowers = (userId: number) => {
  return useInfiniteQuery({
    queryKey: followKeys.followers(userId),
    queryFn: ({ pageParam }) =>
      getFollowersRequest({ id: userId }, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data?.data) {
        return undefined;
      }

      return lastPage.data.data.length < FOLLOW_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    enabled: !!userId,
  });
};

export const useGetFollowing = (userId: number) => {
  return useInfiniteQuery({
    queryKey: followKeys.following(userId),
    queryFn: ({ pageParam }) =>
      getFollowingRequest({ id: userId }, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.success || !lastPage.data?.data) {
        return undefined;
      }

      return lastPage.data.data.length < FOLLOW_PAGE_SIZE
        ? undefined
        : allPages.length;
    },
    enabled: !!userId,
  });
};

export const useGetFollowersCount = (userId: number) => {
  return useQuery({
    queryKey: followKeys.followersCount(userId),
    queryFn: () => getFollowersCountRequest({ id: userId }),
    enabled: !!userId,
  });
};

export const useGetFollowingCount = (userId: number) => {
  return useQuery({
    queryKey: followKeys.followingCount(userId),
    queryFn: () => getFollowingCountRequest({ id: userId }),
    enabled: !!userId,
  });
};

export const useGetFollow = (followerId: number, followedId: number) => {
  return useQuery({
    queryKey: followKeys.detail(followerId, followedId),
    queryFn: () => getFollowRequest({ followerId, followedId }),
    enabled: !isNaN(followerId) && !isNaN(followedId),
  });
};
