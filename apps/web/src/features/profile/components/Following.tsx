import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { X as CloseIcon } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import CardFollowing from "./CardFollowing";
import { useCallback, useEffect, useRef } from "react";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { useGetFollowing } from "@/features/profile/state/useFollow";
import type { Follower } from "@/shared/types/follower.type";

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
  const {
    data: followingData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetFollowing(userId);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    if (onOpenChange) onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [fetchNextPage, followingData, hasNextPage, isFetchingNextPage]);

  const renderFollowingList = () => {
    if (error) {
      return <p>Erro ao carregar usuarios seguidos.</p>;
    }
    if (isLoading) {
      return <p>Carregando usuarios seguidos...</p>;
    }

    const pages = followingData?.pages ?? [];
    const hasFailedPage = pages.some((page) => !page.success);

    if (hasFailedPage) {
      return <p>Erro ao buscar usuarios seguidos.</p>;
    }

    const following = pages.flatMap((page) => page.data?.data ?? []);
    if (!following || !Array.isArray(following) || following.length === 0) {
      return <p>Voce nao esta seguindo ninguem.</p>;
    }

    return (
      <>
        {following.map((followingItem: Follower) => (
          <CardFollowing
            key={followingItem.id}
            user={followingItem.followed}
            onUserClick={handleClose}
          />
        ))}

        {hasNextPage ? (
          <div
            ref={loadMoreRef}
            className="py-4 text-center text-sm text-muted-foreground"
          >
            {isFetchingNextPage ? "Carregando..." : null}
          </div>
        ) : null}
      </>
    );
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
      <DialogContent
        className="h-[80vh] w-[70vw] xl:max-w-[50vw] flex flex-col"
        aria-describedby={undefined}
      >
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
