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

interface CardFollowingProps {
  user: User;
  onUserClick?: () => void;
}

export default function CardFollowing({
  user,
  onUserClick,
}: CardFollowingProps) {
  const initials = getInitials(user?.name);

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
      <div className="ml-auto flex items-center">
        <Button variant="outline" className="text-xs font-normal">
          Deixar de seguir
        </Button>
      </div>
    </CardContent>
  );
}
