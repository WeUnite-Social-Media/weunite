import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Wifi } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkApiHealth } from "@/shared/api/health";
import { Button } from "@/shared/components/ui/button";
import {
  ApiHealthContext,
  type ApiHealthContextValue,
  type ApiHealthStatus,
} from "@/app/providers/apiHealthContext";

const API_HEALTH_QUERY_KEY = ["api-health"] as const;
const HEALTH_CHECK_INTERVAL_MS = 30_000;

export function ApiHealthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasShownOfflineToastRef = useRef(false);
  const [isManualRetrying, setIsManualRetrying] = useState(false);

  const healthQuery = useQuery({
    queryKey: API_HEALTH_QUERY_KEY,
    queryFn: checkApiHealth,
    refetchInterval: HEALTH_CHECK_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 10_000,
  });
  const { refetch } = healthQuery;

  const status: ApiHealthStatus = healthQuery.isError
    ? "offline"
    : healthQuery.isSuccess
      ? "online"
      : "checking";

  useEffect(() => {
    if (status === "offline" && !hasShownOfflineToastRef.current) {
      toast.error("Sem conexao com o servidor.");
      hasShownOfflineToastRef.current = true;
    }

    if (status === "online" && hasShownOfflineToastRef.current) {
      toast.success("Sistema conectado novamente.");
      hasShownOfflineToastRef.current = false;
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== API_HEALTH_QUERY_KEY[0],
      });
    }
  }, [queryClient, status]);

  const retry = useCallback(async () => {
    setIsManualRetrying(true);

    try {
      await refetch();
    } finally {
      setIsManualRetrying(false);
    }
  }, [refetch]);

  const value = useMemo<ApiHealthContextValue>(() => {
    return {
      status,
      isOffline: status === "offline",
      retry,
    };
  }, [retry, status]);

  return (
    <ApiHealthContext.Provider value={value}>
      {children}
      {status === "offline" && (
        <div className="fixed inset-x-0 top-0 z-[100] border-b border-destructive/30 bg-destructive px-4 py-3 text-destructive-foreground shadow-lg">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">
                  Sem conexao com o servidor
                </p>
                <p className="text-sm opacity-90">
                  {isManualRetrying
                    ? "Tentando reconectar..."
                    : "Alguns dados podem estar desatualizados ou indisponiveis."}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                void value.retry();
              }}
              disabled={isManualRetrying}
              className="w-full shrink-0 sm:w-auto"
            >
              {isManualRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              {isManualRetrying ? "Reconectando..." : "Tentar novamente"}
            </Button>
          </div>
        </div>
      )}
    </ApiHealthContext.Provider>
  );
}
