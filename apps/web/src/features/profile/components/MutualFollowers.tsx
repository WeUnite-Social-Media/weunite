import { Link } from "react-router-dom";
import { useGetMutualFollowers } from "@/features/profile/state/useFollow";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import type { MutualFollowers as MutualFollowersData } from "@/shared/types/follower.type";
import { getInitials } from "@/shared/utils/getInitials";

interface MutualFollowersProps {
  targetUserId: number;
  enabled?: boolean;
}

export default function MutualFollowers({
  targetUserId,
  enabled = true,
}: MutualFollowersProps) {
  const { data } = useGetMutualFollowers(targetUserId, enabled);

  const mutual: MutualFollowersData | undefined = data?.success
    ? data.data?.data
    : undefined;

  if (!mutual || mutual.total === 0 || mutual.users.length === 0) {
    return null;
  }

  const extra = mutual.total - mutual.users.length;

  return (
    <div className="mt-2 flex items-center gap-2 pl-5 text-xs text-[#a1a1a1]">
      <div className="flex -space-x-2">
        {mutual.users.map((user) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={user.profileImg} alt={user.username} />
            <AvatarFallback className="text-[10px]">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <p>
        Seguido por{" "}
        {mutual.users.map((user, index) => (
          <span key={user.id}>
            {index > 0 && ", "}
            <Link
              to={`/profile/${user.username}`}
              className="font-medium text-primary hover:underline"
            >
              {user.username}
            </Link>
          </span>
        ))}
        {extra > 0 && <span className="ml-1 font-medium">+{extra}</span>}
      </p>
    </div>
  );
}
