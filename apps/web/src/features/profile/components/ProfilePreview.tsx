import { useNavigate } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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

const calculateAge = (birthDate?: string) => {
  if (!birthDate) {
    return null;
  }

  const parsedBirthDate = new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsedBirthDate.getFullYear();
  const monthDelta = today.getMonth() - parsedBirthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < parsedBirthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

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

  return (
    <Dialog open={Boolean(isOpen)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[30em] md:max-w-[36em]">
        <DialogHeader>
          <DialogTitle>{athlete.name || "Atleta"}</DialogTitle>
          <DialogDescription>
            Visualizacao rapida do atleta inscrito.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 sm:flex-row">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={athlete.profileImg}
              alt={athlete.name || "Atleta"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">@{athlete.username}</p>

            {athlete.bio ? (
              <p className="mt-2 whitespace-pre-wrap text-sm">{athlete.bio}</p>
            ) : null}

            <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
              {age !== null ? <div>Idade: {age} anos</div> : null}
              {athlete.position ? <div>Posicao: {athlete.position}</div> : null}
              {athlete.height ? <div>Altura: {athlete.height} m</div> : null}
              {athlete.weight ? <div>Peso: {athlete.weight} kg</div> : null}
              {athlete.footDomain ? (
                <div>Pe dominante: {athlete.footDomain}</div>
              ) : null}
            </div>

            {athlete.skills?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {athlete.skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
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
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange?.(false);
                navigate(
                  athlete.username
                    ? `/profile/${athlete.username}`
                    : "/profile",
                );
              }}
            >
              Ver perfil completo
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
