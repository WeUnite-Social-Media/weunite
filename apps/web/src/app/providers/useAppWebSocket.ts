import { createContext, useContext } from "react";

export interface AppWebSocketContextValue {
  isConnected: boolean;
  publish: (destination: string, payload: string | object) => void;
  subscribe: (
    destination: string,
    onMessage: (messageBody: string) => void,
  ) => (() => void) | undefined;
}

export const AppWebSocketContext = createContext<AppWebSocketContextValue | null>(
  null,
);

export const useAppWebSocket = () => {
  const context = useContext(AppWebSocketContext);

  if (!context) {
    throw new Error("useAppWebSocket deve ser usado dentro de WebSocketProvider");
  }

  return context;
};
