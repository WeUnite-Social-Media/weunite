import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Moon, Search as SearchIcon, Sun, X as CloseIcon } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useSearchUsers } from "@/features/profile/hooks/useSearchUsers";
import { getInitials } from "@/shared/utils/getInitials";

export function HeaderMobile() {
  const { setTheme, theme } = useTheme();
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data: users, isLoading } = useSearchUsers(searchQuery);

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    setSearchQuery("");
  };

  return (
    <div className="z-50 w-full border-t bg-sidebar">
      <div className="flex h-15 items-center justify-between">
        <div className="ml-4">
          <span className="ml-2 text-xl font-bold">
            <span className="text-primary">We</span>
            <span className="text-third">Unite</span>
          </span>
        </div>

        <div className="mr-6 flex items-center gap-4">
          <NotificationBell />

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Modo de cor"
          >
            <ThemeIcon size={20} className="text-foreground" />
          </button>

          <Drawer>
            <DrawerTrigger>
              <SearchIcon className="h-5 w-5 cursor-pointer" />
            </DrawerTrigger>
            <DrawerContent className="mt-0 h-[80vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh]">
              <DrawerHeader className="relative px-6 pt-8">
                <DrawerClose className="absolute right-4 rounded-sm transition-opacity">
                  <CloseIcon className="h-5 w-5 cursor-pointer" />
                </DrawerClose>
                <DrawerTitle className="mb-4">Pesquisar</DrawerTitle>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="faça sua pesquisa..."
                    className="pl-10"
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4">
                {searchQuery.length === 0 && (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Digite para começar a pesquisar...
                  </p>
                )}

                {searchQuery.length > 0 && isLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length > 0 &&
                  !isLoading &&
                  users &&
                  users.filter((user) => user.id !== String(currentUserId)).length ===
                    0 && (
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                      Nenhum usuário encontrado
                    </p>
                  )}

                {searchQuery.length > 0 &&
                  !isLoading &&
                  users &&
                  users.filter((user) => user.id !== String(currentUserId)).length >
                    0 && (
                    <div className="space-y-2">
                      {users
                        .filter((user) => user.id !== String(currentUserId))
                        .map((user) => {
                          const userName = user.name || "Usuário desconhecido";

                          return (
                            <div
                              key={user.id}
                              className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 hover:bg-muted"
                              onClick={() => handleUserClick(user.username)}
                            >
                              <Avatar className="h-[2.8em] w-[2.8em]">
                                <AvatarImage
                                  src={user.profileImg}
                                  alt={userName}
                                  className="aspect-square h-full w-full rounded-full object-cover"
                                />
                                <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                  {getInitials(userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
