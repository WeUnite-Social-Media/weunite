import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppWebSocket } from "@/app/providers/useAppWebSocket";
import type { Message, SendMessage } from "@/shared/types/chat.types";
import { chatKeys } from "@/features/chat/state/useChat";

interface MessageListQueryResult {
  success: boolean;
  data: Message[] | null;
  message: string | null;
  error: string | null;
}

export const useWebSocket = () => {
  const { isConnected, publish, subscribe } = useAppWebSocket();
  const queryClient = useQueryClient();

  const subscribeToConversation = useCallback(
    (conversationId: number, userId: number) => {
      if (!isConnected) {
        return;
      }

      return subscribe(`/topic/conversation/${conversationId}`, (messageBody) => {
        try {
          const newMessage = JSON.parse(messageBody) as Message;

          queryClient.setQueryData(
            chatKeys.messagesByConversation(conversationId, userId),
            (oldData: MessageListQueryResult | undefined) => {
              if (!oldData?.success) {
                return oldData;
              }

              const messageExists = oldData.data?.some(
                (message) => message.id === newMessage.id,
              );

              if (messageExists) {
                return oldData;
              }

              return {
                ...oldData,
                data: [...(oldData.data || []), newMessage],
              };
            },
          );

          queryClient.invalidateQueries({
            queryKey: chatKeys.conversationsByUser(userId),
          });
        } catch (error) {
          console.error("Erro ao processar mensagem WebSocket:", error);
        }
      });
    },
    [isConnected, queryClient, subscribe],
  );

  const sendMessage = useCallback(
    (message: SendMessage) => {
      if (!isConnected) {
        throw new Error("WebSocket nao esta conectado");
      }

      publish("/app/chat.sendMessage", message);
    },
    [isConnected, publish],
  );

  const subscribeToUserStatus = useCallback(
    (
      userId: number,
      onStatusChange: (status: "ONLINE" | "OFFLINE") => void,
    ) => {
      if (!isConnected) {
        return;
      }

      return subscribe(`/topic/user/${userId}/status`, (messageBody) => {
        try {
          const statusData = JSON.parse(messageBody) as {
            status: "ONLINE" | "OFFLINE";
          };
          onStatusChange(statusData.status);
        } catch (error) {
          console.error("Erro ao processar status do usuario:", error);
        }
      });
    },
    [isConnected, subscribe],
  );

  const notifyOnlineStatus = useCallback(
    (userId: number, status: "ONLINE" | "OFFLINE") => {
      if (!isConnected) {
        return;
      }

      publish("/app/user.status", { userId, status });
    },
    [isConnected, publish],
  );

  return {
    isConnected,
    subscribeToConversation,
    sendMessage,
    subscribeToUserStatus,
    notifyOnlineStatus,
  };
};
