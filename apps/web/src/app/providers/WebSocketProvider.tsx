import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { AppWebSocketContext } from "@/app/providers/useAppWebSocket";

type WebSocketPayload = string | object;

const resolveWebSocketUrl = () => {
  const configuredWebSocketUrl = import.meta.env.VITE_WS_URL?.trim();
  if (configuredWebSocketUrl) {
    return configuredWebSocketUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiBaseUrl || apiBaseUrl === "/api") {
    return "/ws";
  }

  try {
    return new URL("/ws", apiBaseUrl).toString();
  } catch {
    return "/ws";
  }
};

const webSocketUrl = resolveWebSocketUrl();

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const jwt = useAuthStore((state) => state.jwt);
  const userId = useAuthStore((state) => state.user?.id);

  const publish = useCallback(
    (destination: string, payload: WebSocketPayload) => {
      if (!clientRef.current?.connected) {
        throw new Error("WebSocket nao esta conectado");
      }

      clientRef.current.publish({
        destination,
        body: typeof payload === "string" ? payload : JSON.stringify(payload),
      });
    },
    [],
  );

  const subscribe = useCallback(
    (destination: string, onMessage: (messageBody: string) => void) => {
      if (!clientRef.current?.connected) {
        return;
      }

      const subscription = clientRef.current.subscribe(destination, (frame) => {
        onMessage(frame.body);
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    [],
  );

  useEffect(() => {
    if (!jwt) {
      return;
    }

    if (clientRef.current?.connected || clientRef.current?.active) {
      return;
    }

    let presenceIntervalId: number | undefined;

    const sendOnlineStatus = () => {
      if (userId && clientRef.current?.connected) {
        clientRef.current.publish({
          destination: "/app/user.status",
          body: JSON.stringify({
            status: "ONLINE",
          }),
        });
      }
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(webSocketUrl),
      connectHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        sendOnlineStatus();
        presenceIntervalId = window.setInterval(sendOnlineStatus, 45000);
      },
      onDisconnect: () => {
        setIsConnected(false);
        if (presenceIntervalId) {
          window.clearInterval(presenceIntervalId);
          presenceIntervalId = undefined;
        }
      },
      onStompError: (frame) => {
        if (frame.body?.includes("expired")) {
          useAuthStore.getState().logout();
          window.location.href = "/auth/login";
        }
      },
      onWebSocketClose: () => {
        setIsConnected(false);
        if (presenceIntervalId) {
          window.clearInterval(presenceIntervalId);
          presenceIntervalId = undefined;
        }
      },
    });

    clientRef.current = client;
    client.activate();

    const handleBeforeUnload = () => {
      if (userId && client.connected) {
        client.publish({
          destination: "/app/user.status",
          body: JSON.stringify({
            status: "OFFLINE",
          }),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (presenceIntervalId) {
        window.clearInterval(presenceIntervalId);
      }
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [jwt, userId]);

  const value = useMemo(
    () => ({
      isConnected,
      publish,
      subscribe,
    }),
    [isConnected, publish, subscribe],
  );

  return (
    <AppWebSocketContext.Provider value={value}>
      {children}
    </AppWebSocketContext.Provider>
  );
};
