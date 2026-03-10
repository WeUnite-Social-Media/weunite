import { useState, useEffect, useMemo, useCallback } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ConversationList } from "@/components/chat/ConversationList";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { useGetUserConversations } from "@/state/useChat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { getUserById } from "@/api/services/userService";
import type { User } from "@/@types/user.types";
import { formatMessagePreview } from "@/utils/formatMessagePreview";

interface ConversationWithUser {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  otherUserId: number;
}

export const ChatLayout = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [showConversations, setShowConversations] = useState(true);
  const { maxLeftSideBar } = useBreakpoints();
  const [conversationsWithUsers, setConversationsWithUsers] = useState<
    ConversationWithUser[]
  >([]);
  const setIsConversationOpen = useChatStore(
    (state) => state.setIsConversationOpen,
  );

  const { data: conversationsData } = useGetUserConversations(
    Number(userId) || 0,
  );

  useEffect(() => {
    const loadUsersData = async () => {
      if (
        !conversationsData?.success ||
        !conversationsData.data ||
        conversationsData.data.length === 0
      ) {
        setConversationsWithUsers([]);
        return;
      }

      try {
        const conversationsWithUserData = await Promise.all(
          conversationsData.data.map(async (conv) => {
            const otherParticipantId = conv.participantIds.find(
              (id) => id !== Number(userId),
            );

            if (!otherParticipantId) {
              return {
                id: conv.id,
                name: "Usuário Desconhecido",
                avatar: "?",
                avatarColor:
                  "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300",
                lastMessage: formatMessagePreview(
                  conv.lastMessage?.content || "",
                ),
                time: conv.lastMessage
                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                  : "",
                unread: conv.unreadCount,
                online: false,
                otherUserId: 0,
              };
            }

            try {
              const userResponse = await getUserById(otherParticipantId);

              if (userResponse.success && userResponse.data) {
                const user: User = userResponse.data;
                const initials =
                  user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "??";

                const hasValidImage =
                  user.profileImg &&
                  (user.profileImg.startsWith("http://") ||
                    user.profileImg.startsWith("https://") ||
                    user.profileImg.startsWith("data:"));

                return {
                  id: conv.id,
                  name: user.name || `User ${otherParticipantId}`,
                  avatar: hasValidImage ? user.profileImg! : initials,
                  avatarColor:
                    "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                  lastMessage: formatMessagePreview(
                    conv.lastMessage?.content || "",
                  ),
                  time: conv.lastMessage
                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "",
                  unread: conv.unreadCount,
                  online: false,
                  otherUserId: otherParticipantId,
                };
              }
            } catch (error) {
              console.error(
                `Erro ao buscar usuário ${otherParticipantId}:`,
                error,
              );
            }

            return {
              id: conv.id,
              name: `User ${otherParticipantId}`,
              avatar: "U",
              avatarColor:
                "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
              lastMessage: formatMessagePreview(
                conv.lastMessage?.content || "",
              ),
              time: conv.lastMessage
                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              unread: conv.unreadCount,
              online: false,
              otherUserId: otherParticipantId,
            };
          }),
        );

        setConversationsWithUsers(conversationsWithUserData);
      } catch (error) {
        console.error("Erro ao carregar dados dos usuários:", error);
      }
    };

    loadUsersData();
  }, [conversationsData, userId]);

  useEffect(() => {
    if (!activeConversationId && conversationsWithUsers.length > 0) {
      setActiveConversationId(conversationsWithUsers[0].id);
    }
  }, [activeConversationId, conversationsWithUsers]);

  // Limpa o estado quando não estiver mais no mobile ou ao desmontar o componente
  useEffect(() => {
    if (!maxLeftSideBar) {
      setIsConversationOpen(false);
    }

    return () => {
      setIsConversationOpen(false);
    };
  }, [maxLeftSideBar, setIsConversationOpen]);

  const activeConversation = useMemo(() => {
    return conversationsWithUsers.find(
      (conv) => conv.id === activeConversationId,
    );
  }, [conversationsWithUsers, activeConversationId]);

  const handleSelectConversation = useCallback(
    (id: number) => {
      setActiveConversationId(id);
      if (maxLeftSideBar) {
        setShowConversations(false);
        setIsConversationOpen(true); // Marca que uma conversa está aberta no mobile
      }
    },
    [maxLeftSideBar, setIsConversationOpen],
  );

  const handleBack = useCallback(() => {
    setShowConversations(true);
    setIsConversationOpen(false); // Marca que voltou para a lista de conversas
  }, [setIsConversationOpen]);

  // ✅ REMOVIDO: Loading global que causava tela laranja ao trocar de conversa
  // Agora usa placeholderData para transição suave

  return (
    <div
      className={`flex w-full h-[98vh] bg-red ${!maxLeftSideBar ? "rounded-lg shadow-sm border border-border -mt-[0.7em]" : ""} ${maxLeftSideBar ? "min-h-0" : ""}`}
    >
      {/* Mobile/Tablet: Mostra apenas uma tela por vez */}
      {maxLeftSideBar ? (
        <>
          {showConversations ? (
            <ConversationList
              conversations={conversationsWithUsers}
              activeConversationId={activeConversation?.id || 0}
              onSelectConversation={handleSelectConversation}
              isMobile={true}
            />
          ) : activeConversation ? (
            <ChatContainer
              activeConversation={activeConversation}
              onBack={handleBack}
              isMobile={true}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Selecione uma conversa ou pesquise um usuário para começar
              </p>
            </div>
          )}
        </>
      ) : (
        /* Desktop: Mostra ambas as telas lado a lado */
        <div className="flex w-full h-full gap-0">
          <ConversationList
            conversations={conversationsWithUsers}
            activeConversationId={activeConversation?.id || 0}
            onSelectConversation={handleSelectConversation}
            isMobile={false}
          />
          {activeConversation ? (
            <ChatContainer
              activeConversation={activeConversation}
              onBack={handleBack}
              isMobile={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Nenhuma conversa encontrada
                <br />
                Use a barra de pesquisa para encontrar usuários e iniciar uma
                conversa
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
