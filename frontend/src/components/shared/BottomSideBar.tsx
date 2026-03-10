import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { Home, Link, DiamondPlus, User, MessageCircleMore } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CreatePost } from "../post/CreatePost";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BottomSideBar() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const { logout, user } = useAuthStore();

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const getIncoColor = (path: string): string =>
    pathname === path ? "#22C55E" : "currentColor";

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleCreatePostOpen = () => {
    setIsCreatePostOpen(true);
  };

  const items = [
    { title: "Home", url: "/home", icon: Home, color: getIncoColor("/home") },
    {
      title: "Oportunidade",
      url: "/opportunity",
      icon: Link,
      color: getIncoColor("/opportunity"),
    },
    { title: "Criar Publicação", url: "#", icon: DiamondPlus },
    { title: "Chat", url: "/chat", icon: MessageCircleMore },
  ];

  return (
    <>
      <CreatePost open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />

      <div className="fixed bottom-0 w-screen border-t bg-sidebar z-50 ">
        <div className="flex justify-around items-center h-14">
          {items.map((item) => (
            <button
              key={item.title}
              onClick={(e) => {
                e.preventDefault();

                if (item.title === "Criar Publicação") {
                  handleCreatePostOpen();
                } else if (item.url !== "#") {
                  navigate(item.url);
                }
              }}
              className="flex flex-col items-center justify-center w-full py-2 relative"
              aria-label={item.title}
            >
              <item.icon
                size={24}
                color={
                  item.url !== "#" && pathname === item.url
                    ? "#22C55E"
                    : "currentColor"
                }
                className="hover:cursor-pointer"
              />
              {item.url !== "#" && pathname === item.url && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#22C55E] rounded-full" />
              )}
            </button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex flex-col items-center justify-center w-full py-2"
                aria-label="Perfil"
              >
                <Avatar className="h-7 w-7 hover:cursor-pointer">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback>
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-third"
              >
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
