import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { X as CloseIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import CardFollowing from "./CardFollowing";
import { useGetFollowers } from "@/state/useFollow";
import type { Follower } from "@/@types/follower.type";

interface FollowersProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  userId: number;
}

export default function Followers({
  isOpen,
  onOpenChange,
  userId,
}: FollowersProps) {
  const { isDesktop, isTablet } = useBreakpoints();
  const { data: followersData, error } = useGetFollowers(userId);

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
  };

  const renderFollowersList = () => {
    if (error) {
      return <p>Erro ao carregar seguidores.</p>;
    }
    if (!followersData?.success) {
      return <p>Erro ao buscar seguidores.</p>;
    }

    const followers = followersData?.data?.data;
    if (!followers || !Array.isArray(followers) || followers.length === 0) {
      return <p>Nenhum seguidor encontrado.</p>;
    }

    return followers.map((follower: Follower) => (
      <CardFollowing
        key={follower.id}
        user={follower.follower}
        onUserClick={handleClose}
      />
    ));
  };

  if (!isDesktop && isTablet) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh] mt-0">
          <DrawerHeader className="pt-8 px-6 relative">
            <DrawerClose className="absolute rounded-sm transition-opacity right-4">
              <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
            </DrawerClose>
            <DrawerTitle className="mb-4">Seguidores</DrawerTitle>
            <div className="relative">
              <Input placeholder="Pesquisar..." />
            </div>
          </DrawerHeader>
          <div
            className="flex flex-col flex-1 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.scrollbarColor =
                "rgba(0,0,0,0.3) transparent";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.scrollbarColor = "transparent transparent";
            }}
          >
            {renderFollowersList()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] w-[70vw] xl:max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seguidores</DialogTitle>
          <DialogClose />
          <div className="relative">
            <Input placeholder="Pesquisar..." />
          </div>
        </DialogHeader>
        <div
          className="flex flex-col flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.scrollbarColor =
              "rgba(0,0,0,0.3) transparent";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.scrollbarColor = "transparent transparent";
          }}
        >
          {renderFollowersList()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
