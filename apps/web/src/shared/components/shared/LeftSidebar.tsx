import { useEffect, useRef, useState } from "react";
import type { ComponentProps, MouseEvent as ReactMouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  DiamondPlus,
  Home,
  Link,
  LogOut,
  MessageCircleMore,
  Moon,
  Search as SearchIcon,
  Pencil,
  Shield,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Search } from "@/shared/components/shared/Search";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { getInitials } from "@/shared/utils/getInitials";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { CreatePost } from "@/features/feed/components/post/CreatePost";
import { useOnboardingStore } from "@/features/onboarding/state/useOnboardingStore";
import { NotificationPanel } from "@/features/notifications/components/NotificationPanel";
import { useGetUnreadCount } from "@/features/notifications/state/useNotifications";

export function LeftSidebar() {
  const { state, setOpen } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const { logout, user } = useAuthStore();
  const userId = user?.id;
  const initials = getInitials(user?.username);

  const ADMIN_EMAILS = [
    "admin@weunite.com",
    "luiz@weunite.com",
    "matheus@weunite.com",
    "matheusoliveirale2007@gmail.com",
    "manoel_jonathan@hotmail.com",
  ];

  const isAdmin =
    user?.isAdmin || Boolean(user?.email && ADMIN_EMAILS.includes(user.email));

  const { setTheme, theme } = useTheme();
  const themeIcon = theme === "dark" ? Sun : Moon;
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { isMobile, isSmallDesktop } = useBreakpoints();
  const previousDesktop = useRef(isSmallDesktop);
  const startOnboardingTour = useOnboardingStore((state) => state.startTour);

  const { data: unreadCountResponse } = useGetUnreadCount(
    userId ? Number(userId) : 0,
  );
  const unreadCount =
    unreadCountResponse?.success && unreadCountResponse.data
      ? unreadCountResponse.data.unreadCount
      : 0;

  const getIconColor = (path: string) =>
    pathname === path ? "#22C55E" : "currentColor";

  const handleSearchOpen = () => {
    if (state === "expanded") {
      setOpen(false);
    }
    setIsNotificationsOpen(false);
    setIsSearchOpen(true);
  };

  const handleNotificationsOpen = () => {
    if (state === "expanded") {
      setOpen(false);
    }
    setIsSearchOpen(false);
    setIsNotificationsOpen(true);
  };

  const handleCreatePostOpen = () => {
    setIsCreatePostOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const items = [
    { title: "Home", url: "/home", icon: Home },
    { title: "Notificações", url: "#", icon: Bell },
    { title: "Oportunidade", url: "/opportunity", icon: Link },
    { title: "Chat", url: "/chat", icon: MessageCircleMore },
    { title: "Pesquisar", url: "#", icon: SearchIcon },
    { title: "Criar Publicação", url: "#", icon: DiamondPlus },
    { title: "Modo de cor", url: "#", icon: themeIcon },
  ];

  useEffect(() => {
    if (isSearchOpen && state === "expanded") {
      setOpen(false);
    }
  }, [isSearchOpen, setOpen, state]);

  useEffect(() => {
    if (isSmallDesktop && !previousDesktop.current) {
      setOpen(false);
    }

    previousDesktop.current = isSmallDesktop;
  }, [isSmallDesktop, setOpen]);

  const CustomSidebarTrigger = (props: ComponentProps<typeof SidebarTrigger>) => {
    const handleClick = (
      event: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      if (isSearchOpen && state === "collapsed") {
        return;
      }

      props.onClick?.(event);
    };

    return <SidebarTrigger {...props} onClick={handleClick} />;
  };

  return (
    <>
      <Search isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />
      <CreatePost open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />

      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div
            className={
              state === "collapsed"
                ? "flex items-center justify-center"
                : "pt-4"
            }
          >
            {state === "collapsed" || isMobile ? (
              <div className="flex w-full items-center justify-center py-4">
                <span className="text-xl font-bold text-primary">W</span>
                <CustomSidebarTrigger className="m-0 p-0" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span
                  className="ml-2 max-w-xs whitespace-nowrap text-xl font-bold opacity-100 transition-all duration-200"
                  style={{ transition: "all 0.2s" }}
                >
                  <span className="text-primary">We</span>
                  <span className="text-third">Unite</span>
                </span>
                <CustomSidebarTrigger />
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={state === "collapsed" ? "text-center" : ""}>
              {state !== "collapsed" && !isMobile && "Navegação"}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu
                className={
                  state === "collapsed" || isMobile
                    ? "flex flex-col items-center gap-6"
                    : "gap-4"
                }
              >
                {items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={
                      state === "collapsed"
                        ? "mb-2 flex w-full justify-center"
                        : "mb-2"
                    }
                  >
                    <SidebarMenuButton
                      tooltip={state === "collapsed" ? item.title : undefined}
                      onClick={(event) => {
                        event.preventDefault();

                        if (item.title === "Modo de cor") {
                          setTheme(theme === "dark" ? "light" : "dark");
                          return;
                        }

                        if (item.title === "Pesquisar") {
                          handleSearchOpen();
                          return;
                        }

                        if (item.title === "Notificações") {
                          handleNotificationsOpen();
                          return;
                        }

                        if (item.title === "Criar Publicação") {
                          handleCreatePostOpen();
                          return;
                        }

                        if (item.url !== "#") {
                          navigate(item.url);
                        }
                      }}
                      className={`flex cursor-pointer ${
                        state === "collapsed"
                          ? "w-full justify-center py-2"
                          : "items-center gap-2"
                      }`}
                    >
                      <div
                        className={`relative ${
                          state === "collapsed" ? "flex justify-center" : ""
                        }`}
                      >
                        <item.icon
                          style={{
                            width: "24px",
                            height: "24px",
                            color:
                              item.url !== "#" && pathname === item.url
                                ? "#22C55E"
                                : getIconColor(item.url),
                          }}
                        />
                        {item.title === "Notificações" && unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>

                      {state !== "collapsed" && (
                        <span
                          className={
                            item.url !== "#" && pathname === item.url
                              ? "text-[#22C55E]"
                              : ""
                          }
                        >
                          {item.title}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu className="mb-3">
            <SidebarMenuItem
              className={
                state === "collapsed" || isMobile
                  ? "flex w-full justify-center"
                  : ""
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <SidebarMenuButton
                    className={`flex ${
                      state === "collapsed"
                        ? "w-full justify-center"
                        : "items-center gap-2"
                    }`}
                  >
                    <Avatar className={state === "collapsed" ? "mx-auto" : ""}>
                      <AvatarImage src={user?.profileImg} alt={user?.username} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {state !== "collapsed" && <p>{user?.username}</p>}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="top"
                  align={state === "collapsed" ? "start" : "center"}
                  alignOffset={state === "collapsed" ? 8 : 0}
                  sideOffset={state === "collapsed" ? 8 : 6}
                  className="w-56 rounded-lg border p-2 shadow-lg"
                >
                  <div className="mb-1 border-b px-3 py-2">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <div className="space-y-1 py-1">
                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-50"
                      onClick={() => navigate("/profile")}
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <p>Perfil</p>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                        onClick={() => navigate("/admin")}
                      >
                        <Shield className="h-4 w-4 text-blue-500" />
                        <p>Painel Admin</p>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-50"
                      onClick={startOnboardingTour}
                    >
                      <Sparkles className="h-4 w-4 text-gray-500" />
                      <p>Refazer tour</p>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-50"
                      onClick={() => navigate("/profile?modal=edit-profile")}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                      <p>Editar perfil</p>
                    </DropdownMenuItem>
                  </div>

                  <div className="my-1 h-px bg-gray-100" />

                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-red-400 transition-colors hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 -scale-x-100" />
                    <p>Sair</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
