import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { getInitials } from "@/shared/utils/getInitials";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useCreateConversation,
  useGetUserConversations,
} from "@/features/chat/state/useChat";
import { useChatStore } from "@/features/chat/stores/useChatStore";
import { Loader2, Send } from "lucide-react";
import type { User } from "@/shared/types/user.types";

interface ProfilePreviewProps {
  athlete?: User | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProfilePreview({
  athlete,
  isOpen,
  onOpenChange,
}: ProfilePreviewProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUserId = Number(user?.id) || 0;
  const displayUserId = Number(athlete?.id) || 0;

  const setIsConversationOpen = useChatStore((s) => s.setIsConversationOpen);
  const setPendingConversationId = useChatStore(
    (s) => s.setPendingConversationId,
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

  if (!athlete) return null;

  const initials = getInitials(athlete.name || athlete.username || "Atleta");

  return (
    <Dialog open={Boolean(isOpen)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[30em] md:max-w-[36em]">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap gap-2">
            {athlete.name || "Atleta"} -
            {athlete.skills?.map((s) => (
              <Badge key={s.id} variant="secondary">
                {s.name}
              </Badge>
            ))}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={athlete.profileImg}
              alt={athlete.name || "Atleta"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground">@{athlete.username}</p>
            {athlete.bio ? (
              <p className="mt-2 whitespace-pre-wrap text-sm">{athlete.bio}</p>
            ) : null}

            <div className="mt-3 text-sm text-muted-foreground">
              {athlete.position ? <div>Posição: {athlete.position}</div> : null}
              {athlete.height ? <div>Altura: {athlete.height} m</div> : null}
              {athlete.weight ? <div>Peso: {athlete.weight} kg</div> : null}
            </div>
          </div>
        </div>

        <DialogFooter className="flex w-full justify-end">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button
              onClick={handleChat}
              disabled={isCreatingConversation}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
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
              variant="outline"
              className="border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground"
              onClick={() => {
                onOpenChange?.(false);
                navigate(
                  athlete.username
                    ? `/profile/${athlete.username}`
                    : "/profile",
                );
              }}
            >
              Ver perfil
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
