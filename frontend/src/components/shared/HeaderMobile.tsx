import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { X as CloseIcon, Sun, Moon, Search as SearchIcon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/utils/getInitials";
import { useAuthStore } from "@/stores/useAuthStore";

export function HeaderMobile() {
  const { setTheme, theme } = useTheme();
  const themeIcon = theme === "dark" ? Sun : Moon;

  const themeItem = {
    title: "Modo de cor",
    url: "#",
    icon: themeIcon,
  };

  const items = [themeItem];

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data: users, isLoading } = useSearchUsers(searchQuery);

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    setSearchQuery("");
  };

  return (
    <>
      <div className="w-full border-t bg-sidebar z-50">
        <div className="flex justify-between items-center h-15">
          <div className="ml-4">
            <span className="font-bold text-xl ml-2 items-left">
              <span className="text-primary">We</span>
              <span className="text-third">Unite</span>
            </span>
          </div>

          <div className="flex items-center gap-4 mr-6">
            {items.map((item) => (
              <button
                key={item.title}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.title === "Modo de cor") {
                    setTheme(theme === "dark" ? "light" : "dark");
                  }
                }}
                className="p-2 rounded-full hover:bg-muted transition-colors hover:cursor-pointer"
                aria-label={item.title}
              >
                <item.icon size={20} className="text-foreground" />
              </button>
            ))}

            <Drawer>
              <DrawerTrigger>
                <SearchIcon className="h-5 w-5 hover:cursor-pointer" />
              </DrawerTrigger>
              <DrawerContent className="h-[80vh] data-[vaul-drawer-direction=bottom]:max-h-[100vh]  mt-0 ">
                <DrawerHeader className="pt-8 px-6 relative">
                  <DrawerClose className="absolute rounded-sm transition-opacity right-4 ">
                    <CloseIcon className="h-5 w-5 hover:cursor-pointer" />
                  </DrawerClose>
                  <DrawerTitle className="mb-4">Pesquisar</DrawerTitle>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="faça sua pesquisa..."
                      className="pl-10"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4">
                  {searchQuery.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center mt-8">
                      Digite para começar a pesquisar...
                    </p>
                  )}

                  {searchQuery.length > 0 && isLoading && (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1 flex-1">
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
                    users.filter((user) => user.id !== String(currentUserId))
                      .length === 0 && (
                      <p className="text-sm text-muted-foreground text-center mt-8">
                        Nenhum usuário encontrado
                      </p>
                    )}

                  {searchQuery.length > 0 &&
                    !isLoading &&
                    users &&
                    users.filter((user) => user.id !== String(currentUserId))
                      .length > 0 && (
                      <div className="space-y-2">
                        {users
                          .filter((user) => user.id !== String(currentUserId))
                          .map((user) => {
                            const userName =
                              user.name || "Usuário desconhecido";
                            return (
                              <div
                                key={user.id}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
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
                                  <p className="text-sm font-medium">
                                    {userName}
                                  </p>
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
    </>
  );
}
