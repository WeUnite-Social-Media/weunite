import { getInitials } from "@/shared/utils/getInitials";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { CardContent } from "@/shared/components/ui/card";
import type { User } from "@/shared/types/user.types";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useFollowAndUnfollow,
  useGetFollow,
} from "@/features/profile/state/useFollow";

interface CardFollowingProps {
  user: User;
  onUserClick?: () => void;
}

export default function CardFollowing({
  user,
  onUserClick,
}: CardFollowingProps) {
  const { user: authUser } = useAuthStore();
  const initials = getInitials(user?.name);
  const authUserId = Number(authUser?.id);
  const listedUserId = Number(user?.id);
  const isSelf = authUserId === listedUserId;
  const canFollow = Boolean(authUserId && listedUserId && !isSelf);
  const { data: followStatusResponse, isLoading: isFollowStatusLoading } =
    useGetFollow(authUserId, listedUserId);
  const followMutation = useFollowAndUnfollow();
  const isFollowing =
    followStatusResponse?.success === true &&
    followStatusResponse.data?.data?.status === "ACCEPTED";

  const handleFollowClick = () => {
    if (!canFollow) {
      return;
    }

    followMutation.mutate({
      followerId: authUserId,
      followedId: listedUserId,
    });
  };

  return (
    <CardContent className="flex mt-5">
      <Link
        to={`/profile/${user?.username}`}
        className="flex gap-2 items-center flex-1 hover:opacity-80 transition-opacity"
        onClick={onUserClick}
      >
        <Avatar className="w-13 h-13 rounded-full">
          <AvatarImage
            src={user?.profileImg}
            alt="Foto de perfil"
            className="w-full h-full rounded-full object-cover hover:cursor-pointer"
          />
          <AvatarFallback className="w-full h-full flex items-center border-1 border-primary rounded-full justify-center text-primary text-2xl ">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col  items-start justify-center">
          <p className="text-primary font-medium">{user?.username}</p>
          <p className="text-[#a1a1a1] text-xs">{user?.name}</p>
        </div>
      </Link>
      {canFollow ? (
        <div className="ml-auto flex items-center">
          <Button
            type="button"
            variant={isFollowing ? "outline" : "third"}
            className="text-xs font-normal"
            onClick={handleFollowClick}
            disabled={isFollowStatusLoading || followMutation.isPending}
          >
            {isFollowing ? "Deixar de seguir" : "Seguir"}
          </Button>
        </div>
      ) : null}
    </CardContent>
  );
}
