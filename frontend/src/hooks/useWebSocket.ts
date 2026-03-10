import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { SendMessage } from "@/@types/chat.types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/state/useChat";

export const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const jwt = useAuthStore((state) => state.jwt);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!jwt) {
      console.log("⚠️ WebSocket: JWT não encontrado");
      return;
    }

    console.log("🚀 WebSocket: Tentando conectar...");
    console.log("📝 Token (primeiros 50 chars):", jwt.substring(0, 50) + "...");

    const client = new Client({
      webSocketFactory: () => {
        console.log("🔌 Criando conexão SockJS...");
        const socket = new SockJS("http://localhost:8080/ws");

        socket.onopen = () => console.log("✅ SockJS: Conexão aberta");
        socket.onerror = (e) => console.error("❌ SockJS: Erro", e);
        socket.onclose = (e) => console.log("⚠️ SockJS: Conexão fechada", e);

        return socket;
      },
      connectHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("✅ WebSocket: STOMP conectado com sucesso!", frame);
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("⚠️ WebSocket: STOMP desconectado");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("❌ WebSocket STOMP error:", {
          command: frame.command,
          headers: frame.headers,
          body: frame.body,
        });
      },
      onWebSocketError: (event) => {
        console.error("❌ WebSocket connection error:", event);
      },
      onWebSocketClose: (event) => {
        console.log("🔌 WebSocket fechado:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
      },
    });

    console.log("🔄 Ativando cliente WebSocket...");
    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🔌 WebSocket: Desativando conexão");
      client.deactivate();
    };
  }, [jwt]);

  const subscribeToConversation = useCallback(
    (conversationId: number, userId: number) => {
      if (!clientRef.current?.connected) {
        return;
      }

      const subscription = clientRef.current.subscribe(
        `/topic/conversation/${conversationId}`,
        (messageFrame) => {
          try {
            // Parseia a mensagem recebida
            const newMessage = JSON.parse(messageFrame.body);

            // Atualiza o cache DIRETAMENTE sem refetch
            queryClient.setQueryData(
              chatKeys.messagesByConversation(conversationId, userId),
              (oldData: any) => {
                if (!oldData?.success) return oldData;

                // Verifica se a mensagem já existe (evita duplicatas)
                const messageExists = oldData.data?.some(
                  (msg: any) => msg.id === newMessage.id,
                );

                if (messageExists) return oldData;

                // Adiciona nova mensagem ao final
                return {
                  ...oldData,
                  data: [...(oldData.data || []), newMessage],
                };
              },
            );

            // Atualiza lista de conversas (última mensagem)
            queryClient.invalidateQueries({
              queryKey: chatKeys.conversationsByUser(userId),
            });
          } catch (error) {
            console.error("Erro ao processar mensagem WebSocket:", error);
          }
        },
      );

      return () => {
        subscription.unsubscribe();
      };
    },
    [queryClient],
  );

  const sendMessage = useCallback(
    (message: SendMessage) => {
      if (!clientRef.current?.connected) {
        throw new Error("WebSocket não está conectado");
      }

      // Cria mensagem otimista para aparecer imediatamente
      const optimisticMessage = {
        id: Date.now(), // ID temporário
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isRead: false,
        createdAt: new Date().toISOString(),
        readAt: null,
        type: message.type || "TEXT",
      };

      // Adiciona mensagem ao cache IMEDIATAMENTE
      queryClient.setQueryData(
        chatKeys.messagesByConversation(
          message.conversationId,
          message.senderId,
        ),
        (oldData: any) => {
          if (!oldData?.success) return oldData;

          return {
            ...oldData,
            data: [...(oldData.data || []), optimisticMessage],
          };
        },
      );

      // Envia via WebSocket - backend salva e notifica todos
      clientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(message),
      });
    },
    [queryClient],
  );

  return {
    isConnected,
    subscribeToConversation,
    sendMessage,
  };
};
