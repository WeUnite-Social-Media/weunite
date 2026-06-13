import { createContext, useContext } from "react";

export type ApiHealthStatus = "checking" | "online" | "offline";

export interface ApiHealthContextValue {
  status: ApiHealthStatus;
  isOffline: boolean;
  retry: () => Promise<void>;
}

export const ApiHealthContext = createContext<ApiHealthContextValue>({
  status: "checking",
  isOffline: false,
  retry: async () => undefined,
});

export function useApiHealthStatus() {
  return useContext(ApiHealthContext);
}
