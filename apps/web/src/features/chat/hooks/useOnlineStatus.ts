import { useState, useEffect } from "react";
import { useWebSocket } from "@/features/chat/hooks/useWebSocket";
import { instance as axios } from "@/shared/api/http";

/**
 * Hook para rastrear o status online de um usuário específico.
 *
 * 1. Fetches the initial status via REST on mount.
 * 2. Subscribes to real-time WebSocket status updates for the given user.
 */
export const useOnlineStatus = (userId: number | undefined): boolean => {
  const [isOnline, setIsOnline] = useState(false);
  const { subscribeToUserStatus, isConnected } = useWebSocket();

  useEffect(() => {
    if (!userId || !isConnected) return;

    const fetchInitialStatus = async () => {
      try {
        const response = await axios.get(`/users/${userId}/status`);
        const initialStatus = response.data.status as string;
        setIsOnline(initialStatus === "ONLINE");
      } catch {
        setIsOnline(false);
      }
    };

    void fetchInitialStatus();

    const unsubscribe = subscribeToUserStatus(userId, (status) => {
      setIsOnline(status === "ONLINE");
    });

    return () => {
      if (unsubscribe) unsubscribe();
      setIsOnline(false);
    };
  }, [userId, subscribeToUserStatus, isConnected]);

  return isOnline;
};
