import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { X as CloseIcon } from "lucide-react";
import { Input } from "../ui/input";
import CardFollowing from "./CardFollowing";
import { useCallback } from "react";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { useGetFollowing } from "@/state/useFollow";
import type { Follower } from "@/@types/follower.type";

interface FollowingProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  userId: number;
}

export default function Following({
  isOpen,
  onOpenChange,
  userId,
}: FollowingProps) {
  const { isDesktop, isTablet } = useBreakpoints();
  const { data: followingData, error } = useGetFollowing(userId);

  const handleClose = useCallback(() => {
    if (onOpenChange) onOpenChange(false);
  }, [onOpenChange]);

  const renderFollowingList = () => {
    if (error) {
      return <p>Erro ao carregar usuários seguidos.</p>;
    }
    if (!followingData?.success) {
      return <p>Erro ao buscar usuários seguidos.</p>;
    }
    const following = followingData?.data?.data;
    if (!following || !Array.isArray(following) || following.length === 0) {
      return <p>Você não está seguindo ninguém.</p>;
    }

    return following.map((followingItem: Follower) => (
      <CardFollowing
        key={followingItem.id}
        user={followingItem.followed}
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
            <DrawerTitle className="mb-4">Seguindo</DrawerTitle>
            <div className="relative">
              <Input placeholder="Pesquisar..." />
            </div>
          </DrawerHeader>
          <div
            className="flex flex-col overflow-y-auto px-2 pt-2"
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
            {renderFollowingList()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] w-[70vw] xl:max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seguindo</DialogTitle>
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
          {renderFollowingList()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
