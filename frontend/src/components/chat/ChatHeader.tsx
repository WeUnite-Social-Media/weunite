import { Phone, Video, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/api/services/userService";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  online: boolean;
  otherUserId?: number;
}

interface ChatHeaderProps {
  conversation: Conversation | undefined;
  onBack?: () => void;
  isMobile?: boolean;
}

export const ChatHeader = ({
  conversation,
  onBack,
  isMobile = false,
}: ChatHeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["user-profile", conversation?.otherUserId],
    queryFn: async () => {
      if (!conversation?.otherUserId) return null;
      const result = await getUserById(conversation.otherUserId);
      return result.success ? result.data : null;
    },
    enabled: !!conversation?.otherUserId && isProfileOpen,
  });

  if (!conversation) return null;

  const ProfilePreview = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ) : userProfile ? (
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="flex flex-col items-center gap-3 mt-4 relative">
            {userProfile.profileImg ? (
              <img
                src={userProfile.profileImg}
                alt={userProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center border-4 border-background shadow-lg text-2xl font-bold">
                {userProfile.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "??"}
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-semibold">{userProfile.name}</h3>
              {userProfile.username && (
                <p className="text-sm text-muted-foreground">
                  @{userProfile.username}
                </p>
              )}
              {conversation.online && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                  Online agora
                </p>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3 px-2">
            {userProfile.role && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tipo de Conta</p>
                <p className="text-sm font-medium">
                  {userProfile.role.toLowerCase() === "athlete"
                    ? "Atleta"
                    : "Empresa"}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Button
              className={isMobile ? "w-auto px-16 h-10 text-sm" : "w-full"}
              onClick={() => {
                setIsProfileOpen(false);
                navigate(`/profile/${userProfile.username}`);
              }}
            >
              Ver Perfil Completo
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não foi possível carregar as informações do usuário
          </p>
        </div>
      )}
    </div>
  );

  const InfoButton = (
    <Button variant="ghost" size="icon" onClick={() => setIsProfileOpen(true)}>
      <Info size={18} />
    </Button>
  );

  return (
    <div className="h-16 border-b border-border px-4 md:px-6 flex items-center justify-between bg-card">
      <div className="flex items-center">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft size={20} />
          </Button>
        )}
        <div className="relative">
          {conversation.avatar.startsWith("http") ? (
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full ${conversation.avatarColor} flex items-center justify-center mr-3`}
            >
              <span className="font-medium">{conversation.avatar}</span>
            </div>
          )}
          {/* Indicador de status online */}
          {conversation.online && (
            <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
          )}
        </div>
        <div>
          <h2 className="font-medium">{conversation.name}</h2>
          <p className="text-xs text-muted-foreground">
            {conversation.online ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Online
              </span>
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Phone size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Video size={18} />
        </Button>

        {isMobile ? (
          <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <SheetTrigger asChild>{InfoButton}</SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <SheetHeader>
                <SheetTitle>Informações do Usuário</SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <ProfilePreview />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>{InfoButton}</DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Informações do Usuário</DialogTitle>
              </DialogHeader>
              <div className="mt-4 overflow-y-auto max-h-[75vh]">
                <ProfilePreview />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
