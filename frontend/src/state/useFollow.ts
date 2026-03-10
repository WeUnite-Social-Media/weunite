import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followAndUnfollowRequest,
  getFollowersRequest,
  getFollowingRequest,
  getFollowRequest,
} from "@/api/services/followerService";
import { toast } from "sonner";

export const followKeys = {
  all: ["follows"] as const,
  lists: () => [...followKeys.all, "list"] as const,
  followers: (userId: number) =>
    [...followKeys.lists(), "followers", userId] as const,
  following: (userId: number) =>
    [...followKeys.lists(), "following", userId] as const,
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
        queryClient.invalidateQueries({
          queryKey: followKeys.followers(followedId),
        });
        queryClient.invalidateQueries({
          queryKey: followKeys.following(followerId),
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

export const useGetFollowers = (userId: number) => {
  return useQuery({
    queryKey: followKeys.followers(userId),
    queryFn: () => getFollowersRequest({ id: userId }),
    enabled: !!userId,
  });
};

export const useGetFollowing = (userId: number) => {
  return useQuery({
    queryKey: followKeys.following(userId),
    queryFn: () => getFollowingRequest({ id: userId }),
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
