import { useAuthStore } from "@/stores/useAuthStore";
import { useUserProfile } from "./useUserProfile";
import { useFollowAndUnfollow, useGetFollow } from "@/state/useFollow";
import { useEffect, useState } from "react";

export const useFollowAction = (profileUsername?: string) => {
  const { user: authUser } = useAuthStore();
  const { data: profileUser, isLoading: isProfileLoading } =
    useUserProfile(profileUsername);

  const followerId = authUser?.id;
  const followedId = profileUser?.id;

  const { data: followStatusResponse, isLoading: isFollowStatusLoading } =
    useGetFollow(Number(followerId), Number(followedId));

  const { mutate: follow, isPending: isFollowingMutation } =
    useFollowAndUnfollow();

  const initialIsFollowing =
    followStatusResponse?.success === true &&
    followStatusResponse.data?.status === "ACCEPTED";

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollow = () => {
    if (followerId && followedId) {
      setIsFollowing((prev) => !prev);
      follow({
        followerId: Number(followerId),
        followedId: Number(followedId),
      });
    }
  };

  return {
    isFollowing,
    handleFollow,
    isLoading: isProfileLoading || isFollowStatusLoading || isFollowingMutation,
  };
};
