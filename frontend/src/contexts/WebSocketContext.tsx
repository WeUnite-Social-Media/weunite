import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { SendMessage } from "@/@types/chat.types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/state/useChat";

interface WebSocketContextType {
  isConnected: boolean;
  subscribeToConversation: (
    conversationId: number,
    userId: number,
  ) => (() => void) | undefined;
  sendMessage: (message: SendMessage) => void;
  subscribeToUserStatus: (
    userId: number,
    onStatusChange: (status: "ONLINE" | "OFFLINE") => void,
  ) => (() => void) | undefined;
  notifyOnlineStatus: (userId: number, status: "ONLINE" | "OFFLINE") => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const jwt = useAuthStore((state) => state.jwt);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  // ✅ Cria a conexão WebSocket UMA ÚNICA VEZ quando o app carrega
  useEffect(() => {
    if (!jwt) {
      console.log("⚠️ WebSocket: JWT não encontrado");
      return;
    }

    // ✅ Se já existe uma conexão ativa, não recria
    if (clientRef.current?.connected) {
      console.log("✅ WebSocket: Já conectado, reutilizando conexão");
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

        // Notifica que o usuário está online
        if (userId) {
          setTimeout(() => {
            client.publish({
              destination: "/app/user.status",
              body: JSON.stringify({
                userId: Number(userId),
                status: "ONLINE",
              }),
            });
            console.log(`✅ Usuário ${userId} marcado como ONLINE`);
          }, 500);
        }
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

        // Verifica se é erro de token expirado
        if (frame.body && frame.body.includes("expired")) {
          console.log("⚠️ Token expirado no WebSocket, fazendo logout...");
          useAuthStore.getState().logout();
          window.location.href = "/auth/login";
        }
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

    // ✅ Notifica OFFLINE quando o usuário sair da página
    const handleBeforeUnload = () => {
      if (userId && client.connected) {
        client.publish({
          destination: "/app/user.status",
          body: JSON.stringify({ userId: Number(userId), status: "OFFLINE" }),
        });
        console.log(`📴 Usuário ${userId} marcado como OFFLINE`);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // ✅ Cleanup apenas quando o app desmonta (praticamente nunca)
    return () => {
      console.log("🔌 WebSocket: Desativando conexão (app desmontado)");
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      client.deactivate();
    };
  }, [jwt, userId]);

  const subscribeToConversation = useCallback(
    (conversationId: number, userId: number) => {
      if (!clientRef.current?.connected) {
        console.warn("⚠️ WebSocket não conectado, aguardando...");
        return;
      }

      console.log(`📡 Inscrevendo em /topic/conversation/${conversationId}`);

      const subscription = clientRef.current.subscribe(
        `/topic/conversation/${conversationId}`,
        (messageFrame) => {
          try {
            // Parseia a mensagem recebida
            const newMessage = JSON.parse(messageFrame.body);
            console.log("📩 Nova mensagem recebida via WebSocket:", newMessage);

            // Atualiza o cache DIRETAMENTE sem refetch
            queryClient.setQueryData(
              chatKeys.messagesByConversation(conversationId, userId),
              (oldData: any) => {
                if (!oldData?.success) return oldData;

                // Verifica se a mensagem já existe (evita duplicatas)
                const messageExists = oldData.data?.some(
                  (msg: any) => msg.id === newMessage.id,
                );

                if (messageExists) {
                  console.log("⚠️ Mensagem duplicada ignorada:", newMessage.id);
                  return oldData;
                }

                console.log("✅ Adicionando mensagem ao cache");
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
            console.error("❌ Erro ao processar mensagem WebSocket:", error);
          }
        },
      );

      return () => {
        console.log(
          `📴 Desinscrevendo de /topic/conversation/${conversationId}`,
        );
        subscription.unsubscribe();
      };
    },
    [queryClient],
  );

  const sendMessage = useCallback((message: SendMessage) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket não está conectado");
      throw new Error("WebSocket não está conectado");
    }

    console.log("📤 Enviando mensagem via WebSocket:", message);

    // ✅ Envia via WebSocket - backend salva e notifica todos
    // A mensagem vai chegar via subscribeToConversation para TODOS os usuários (incluindo o remetente)
    clientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
    });

    console.log("✅ Mensagem enviada, aguardando confirmação do servidor");
  }, []);

  // ✅ Inscreve-se para receber atualizações de status de um usuário específico
  const subscribeToUserStatus = useCallback(
    (
      userId: number,
      onStatusChange: (status: "ONLINE" | "OFFLINE") => void,
    ) => {
      if (!clientRef.current?.connected) {
        console.warn("⚠️ WebSocket não conectado para status de usuário");
        return;
      }

      console.log(`👤 Inscrevendo no status do usuário ${userId}`);

      const subscription = clientRef.current.subscribe(
        `/topic/user/${userId}/status`,
        (statusFrame) => {
          try {
            const statusData = JSON.parse(statusFrame.body);
            console.log(
              `📊 Status atualizado do usuário ${userId}:`,
              statusData,
            );
            onStatusChange(statusData.status);
          } catch (error) {
            console.error("❌ Erro ao processar status do usuário:", error);
          }
        },
      );

      return () => {
        console.log(`📴 Desinscrevendo do status do usuário ${userId}`);
        subscription.unsubscribe();
      };
    },
    [],
  );

  // ✅ Notifica o servidor sobre mudança de status do usuário atual
  const notifyOnlineStatus = useCallback(
    (userId: number, status: "ONLINE" | "OFFLINE") => {
      if (!clientRef.current?.connected) {
        console.warn("⚠️ WebSocket não conectado para notificar status");
        return;
      }

      console.log(`📢 Notificando status ${status} para usuário ${userId}`);

      clientRef.current.publish({
        destination: "/app/user.status",
        body: JSON.stringify({ userId, status }),
      });
    },
    [],
  );

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribeToConversation,
        sendMessage,
        subscribeToUserStatus,
        notifyOnlineStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket deve ser usado dentro de WebSocketProvider");
  }
  return context;
};
