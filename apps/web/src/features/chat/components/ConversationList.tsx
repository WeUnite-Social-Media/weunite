import { useMemo, useState, memo } from "react";
import { Search, Plus, Loader2, MessageCircle } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useSearchUsers } from "@/features/profile/hooks/useSearchUsers";
import { useCreateConversation } from "@/features/chat/state/useChat";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useSearchMessages } from "@/features/chat/hooks/useSearchMessages";
import { formatMessagePreview } from "@/shared/utils/formatMessagePreview";
import { formatBrazilTime } from "@/shared/utils/formatBrazilTime";
import { useChatStore } from "@/features/chat/stores/useChatStore";

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: number;
  onSelectConversation: (id: number) => void;
  isMobile?: boolean;
}

export const ConversationList = memo(
  ({
    conversations,
    activeConversationId,
    onSelectConversation,
    isMobile = false,
  }: ConversationListProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const userId = useAuthStore((state) => state.user?.id);

    const { data: searchResults, isLoading: isSearchingUsers } =
      useSearchUsers(searchQuery);
    const { data: messageResults, isLoading: isSearchingMessages } =
      useSearchMessages(searchQuery, Number(userId) || 0);
    const createConversation = useCreateConversation();
    const setPendingConversationId = useChatStore(
      (state) => state.setPendingConversationId,
    );
    const setPendingMessageId = useChatStore(
      (state) => state.setPendingMessageId,
    );

    const conversationsById = useMemo(
      () =>
        new Map(
          conversations.map((conversation) => [conversation.id, conversation]),
        ),
      [conversations],
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const startNewConversation = async (targetUserId: string) => {
      if (!userId) {
        console.log("❌ userId não está definido");
        return;
      }

      console.log("🚀 Iniciando criação de conversa:", {
        userId,
        targetUserId,
        participantIds: [Number(userId), Number(targetUserId)],
      });

      try {
        const result = await createConversation.mutateAsync({
          initiatorUserId: Number(userId),
          participantIds: [Number(userId), Number(targetUserId)],
        });

        console.log("✅ Resultado da criação:", result);

        if (result.success && result.data) {
          console.log("✅ Conversa criada com sucesso! ID:", result.data.id);

          // Limpa a busca primeiro
          setSearchQuery("");

          // Seleciona a conversa (a invalidação já é feita pelo mutation no useChat.ts)
          onSelectConversation(result.data.id);
        } else {
          console.error("❌ Falha ao criar conversa:", result.error);
        }
      } catch (error) {
        console.error("❌ Erro ao criar conversa:", error);
      }
    };

    const openMessageConversation = (
      conversationId: number,
      messageId: number,
    ) => {
      setPendingConversationId(conversationId);
      setPendingMessageId(messageId);

      setSearchQuery("");
      onSelectConversation(conversationId);
    };

    return (
      <div
        className={`${isMobile ? "w-full h-full min-h-0" : "w-80 md:w-96 h-full"} ${!isMobile ? "border-r border-border" : ""} bg-card flex flex-col overflow-hidden`}
      >
        <div className="p-3 md:p-4 border-b border-border sticky top-0 z-10 bg-card shrink-0">
          <h1 className="text-lg md:text-xl font-semibold mb-3">Conversas</h1>
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9"
              placeholder="Pesquisar usuários ou mensagens..."
            />
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-muted-foreground"
            />
          </div>
        </div>

        {searchQuery.length > 0 ? (
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            <div className="p-3 bg-muted text-sm text-muted-foreground font-medium">
              Resultados da pesquisa
            </div>
            {isSearchingUsers || isSearchingMessages ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : (searchResults && searchResults.length > 0) ||
              (messageResults && messageResults.length > 0) ? (
              <div className="flex flex-col">
                {searchResults && searchResults.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Usuários
                    </div>
                    {searchResults
                      .filter((user) => user.id !== String(userId))
                      .map((user) => {
                        const userName = user.name || "Usuário desconhecido";
                        const initials =
                          userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "??";

                        return (
                          <div
                            key={user.id}
                            className="flex items-center p-3 hover:bg-muted cursor-pointer border-b border-border"
                            onClick={() =>
                              user.id && startNewConversation(user.id)
                            }
                          >
                            {user.profileImg ? (
                              <img
                                src={user.profileImg}
                                alt={userName}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center mr-3">
                                <span className="font-medium">{initials}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{userName}</div>
                              {user.username && (
                                <div className="text-xs text-muted-foreground">
                                  @{user.username}
                                </div>
                              )}
                            </div>
                            <button
                              className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                              disabled={createConversation.isPending}
                            >
                              {createConversation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Plus size={16} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}

                {messageResults && messageResults.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Mensagens
                    </div>
                    {messageResults.map((message) => {
                      const conversation = conversationsById.get(
                        message.conversationId,
                      );

                      return (
                        <button
                          key={message.id}
                          type="button"
                          className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted border-b border-border"
                          onClick={() =>
                            openMessageConversation(
                              message.conversationId,
                              message.id,
                            )
                          }
                        >
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <MessageCircle size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {conversation?.name || "Conversa"}
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span>
                                {message.senderId === Number(userId)
                                  ? "Você"
                                  : "Mensagem encontrada"}
                              </span>
                              <span>{formatBrazilTime(message.createdAt)}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground truncate">
                              {formatMessagePreview(message.content)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(!searchResults || searchResults.length === 0) &&
                  (!messageResults || messageResults.length === 0) && (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhum usuário ou mensagem encontrada
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum usuário ou mensagem encontrada
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 cursor-pointer border-b border-border ${
                    activeConversationId === conversation.id
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
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
                        <span className="font-medium">
                          {conversation.avatar}
                        </span>
                      </div>
                    )}
                    {conversation.online && (
                      <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">
                        {conversation.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-2">
                  Nenhuma conversa ainda
                </p>
                <p className="text-sm text-muted-foreground">
                  Use a barra de pesquisa acima para encontrar usuários ou
                  mensagens
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

ConversationList.displayName = "ConversationList";
