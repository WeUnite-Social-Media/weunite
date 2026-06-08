import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInYears, parseISO } from "date-fns";
import {
  Calendar,
  Footprints,
  Loader2,
  Ruler,
  Send,
  Target,
  Weight,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useCreateConversation,
  useGetUserConversations,
} from "@/features/chat/state/useChat";
import { useChatStore } from "@/features/chat/stores/useChatStore";
import { getInitials } from "@/shared/utils/getInitials";
import type { User } from "@/shared/types/user.types";

interface ProfilePreviewProps {
  athlete?: User | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const calculateAge = (birthDate?: string) =>
  birthDate && !Number.isNaN(Date.parse(birthDate))
    ? differenceInYears(new Date(), parseISO(birthDate))
    : null;

export default function ProfilePreview({
  athlete,
  isOpen,
  onOpenChange,
}: ProfilePreviewProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUserId = Number(user?.id) || 0;
  const displayUserId = Number(athlete?.id) || 0;

  const setIsConversationOpen = useChatStore(
    (state) => state.setIsConversationOpen,
  );
  const setPendingConversationId = useChatStore(
    (state) => state.setPendingConversationId,
  );

  const { data: conversationsData } = useGetUserConversations(currentUserId);
  const { mutateAsync: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const handleChat = async () => {
    if (!currentUserId || !displayUserId || currentUserId === displayUserId) {
      return;
    }

    const existingConversation = conversationsData?.data?.find(
      (conversation) =>
        conversation.participantIds.includes(displayUserId) &&
        conversation.participantIds.length === 2,
    );

    if (existingConversation) {
      setPendingConversationId(existingConversation.id);
      setIsConversationOpen(true);
      onOpenChange?.(false);
      navigate("/chat");
      return;
    }

    const result = await createConversation({
      initiatorUserId: currentUserId,
      participantIds: [currentUserId, displayUserId],
    });

    if (result.success && result.data) {
      setPendingConversationId(result.data.id);
      setIsConversationOpen(true);
      onOpenChange?.(false);
      navigate("/chat");
    }
  };

  if (!athlete) {
    return null;
  }

  const initials = getInitials(athlete.name || athlete.username || "Atleta");
  const age = calculateAge(athlete.birthDate);
  const hasSkills = Boolean(athlete.skills?.length);

  return (
    <Dialog open={Boolean(isOpen)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[38em]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage
                src={athlete.profileImg}
                alt={athlete.name || "Atleta"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <DialogTitle className="truncate text-xl">
                {athlete.name || "Atleta"}
              </DialogTitle>
              <p className="truncate text-sm text-muted-foreground">
                @{athlete.username}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {athlete.bio || "Nenhuma descricao informada."}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Caracteristicas
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <PreviewInfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Idade"
                value={age !== null ? `${age} anos` : "N/A"}
              />
              <PreviewInfoItem
                icon={<Target className="h-4 w-4" />}
                label="Posicao"
                value={athlete.position || "N/A"}
              />
              <PreviewInfoItem
                icon={<Footprints className="h-4 w-4" />}
                label="Pe dominante"
                value={athlete.footDomain || "N/A"}
              />
              <PreviewInfoItem
                icon={<Ruler className="h-4 w-4" />}
                label="Altura"
                value={athlete.height ? `${athlete.height}m` : "N/A"}
              />
              <PreviewInfoItem
                icon={<Weight className="h-4 w-4" />}
                label="Peso"
                value={athlete.weight ? `${athlete.weight}kg` : "N/A"}
              />
            </div>
          </div>

          {hasSkills ? (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Habilidades
                </h3>

                <div className="flex flex-wrap gap-2">
                  {athlete.skills?.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="bg-secondary/50 px-3 py-1 text-xs font-normal transition-colors hover:bg-secondary/70"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange?.(false);
              navigate(
                athlete.username ? `/profile/${athlete.username}` : "/profile",
              );
            }}
          >
            Ver perfil completo
          </Button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
              Fechar
            </Button>

            <Button onClick={handleChat} disabled={isCreatingConversation}>
              {isCreatingConversation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Abrindo...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Conversar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewInfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-sm font-medium text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}
