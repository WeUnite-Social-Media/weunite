import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { triggerHapticFeedback } from "@/utils/hapticFeedback";
import { useWebSocket } from "@/contexts/WebSocketContext";
import {
  useGetConversationMessages,
  useMarkMessagesAsRead,
} from "@/state/useChat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  online: boolean;
  otherUserId: number;
}

interface ChatContainerProps {
  activeConversation: Conversation | undefined;
  onBack?: () => void;
  isMobile?: boolean;
}

export const ChatContainer = ({
  activeConversation,
  onBack,
  isMobile = false,
}: ChatContainerProps) => {
  const userId = useAuthStore((state) => state.user?.id);
  const [isOtherTyping] = useState(false);

  // ✅ Hook para rastrear status online do outro usuário
  const isOtherUserOnline = useOnlineStatus(activeConversation?.otherUserId);

  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Swipe gesture state
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const { data: messagesData } = useGetConversationMessages(
    activeConversation?.id || 0,
    Number(userId) || 0,
  );

  const { mutate: markAsRead } = useMarkMessagesAsRead();

  const { isConnected, subscribeToConversation, sendMessage } = useWebSocket();

  const messages = messagesData?.success ? messagesData.data || [] : [];

  // ✅ Inscreve no WebSocket para receber mensagens em tempo real
  useEffect(() => {
    if (!activeConversation?.id || !userId) return;

    console.log("📡 Inscrito no chat em tempo real:", activeConversation.id);

    const unsubscribe = subscribeToConversation(
      activeConversation.id,
      Number(userId),
    );

    // ✅ Marca como lido apenas uma vez quando abre a conversa
    // Usa setTimeout para garantir que as mensagens já foram carregadas
    const timeoutId = setTimeout(() => {
      markAsRead({
        conversationId: activeConversation.id,
        userId: Number(userId),
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      console.log("📴 Desinscrito do chat:", activeConversation.id);
      if (unsubscribe) unsubscribe();
    };
    // ✅ APENAS quando conversa ativa ou userId mudam, não quando mensagens chegam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id, userId]);

  // ✅ Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }

    if (messages.length > 0) {
      console.log("📨 Total de mensagens:", messages.length);
    }
  }, [messages]);

  // Handle touch events for swipe and pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);

    // Handle pull-to-refresh only if we're at the top of messages
    if (messageAreaRef.current && touchStartY !== null) {
      const scrollTop = messageAreaRef.current.scrollTop;
      const currentY = e.targetTouches[0].clientY;
      const deltaY = currentY - touchStartY;

      if (scrollTop === 0 && deltaY > 0 && deltaY < 100) {
        setPullDistance(deltaY);
        e.preventDefault(); // Prevent default scroll behavior
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -50;

    // Swipe right to go back on mobile
    if (isRightSwipe && isMobile && onBack) {
      triggerHapticFeedback("light");
      onBack();
    }

    // Handle pull-to-refresh
    if (pullDistance > 60) {
      handleRefresh();
    }
    setPullDistance(0);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHapticFeedback("medium");

    // Simulate loading new messages
    setTimeout(() => {
      setIsRefreshing(false);
      // Could add new messages here in a real app
    }, 1500);
  };

  const handleSendMessage = (text: string) => {
    if (!activeConversation?.id || !userId || !isConnected) return;

    triggerHapticFeedback("light");

    sendMessage({
      conversationId: activeConversation.id,
      senderId: Number(userId),
      content: text,
      type: "TEXT",
    });
  };

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Selecione uma conversa para começar
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${isMobile ? "w-full h-full" : "flex-1 h-full"} relative ${!isMobile ? "rounded-r-lg bg-background" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header fixo no topo */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 ${!isMobile ? "rounded-tr-lg" : ""}`}
      >
        <ChatHeader
          conversation={
            activeConversation
              ? {
                  ...activeConversation,
                  online: isOtherUserOnline,
                  otherUserId: activeConversation.otherUserId,
                }
              : undefined
          }
          onBack={onBack}
          isMobile={isMobile}
        />
      </div>

      {/* Área de mensagens com scroll */}
      <div
        ref={messageAreaRef}
        className={`absolute top-16 left-0 right-0 overflow-y-auto bg-background custom-scrollbar ${isMobile ? "bottom-20" : "bottom-[80px]"}`}
        style={{
          transform:
            pullDistance > 0
              ? `translateY(${Math.min(pullDistance * 0.5, 30)}px)`
              : "none",
        }}
      >
        {/* Pull-to-refresh indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div className="flex justify-center items-center py-4">
            <div
              className={`transition-all duration-200 ${isRefreshing ? "animate-spin" : ""}`}
            >
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div
                  className={`text-sm text-muted-foreground transition-opacity duration-200 ${pullDistance > 60 ? "opacity-100" : "opacity-50"}`}
                >
                  {pullDistance > 60
                    ? "↓ Solte para atualizar"
                    : "↓ Puxe para atualizar"}
                </div>
              )}
            </div>
          </div>
        )}
        <MessageList
          messages={messages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.senderId === Number(userId) ? "me" : "other",
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: msg.isRead,
          }))}
        />
        <TypingIndicator
          isTyping={isOtherTyping}
          userName={activeConversation?.name}
        />
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 z-10 ${!isMobile ? "rounded-br-lg" : ""}`}
      >
        <MessageInput
          conversationId={activeConversation.id}
          senderId={Number(userId)}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
