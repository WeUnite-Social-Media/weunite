import { useState, useEffect } from "react";
import { useWebSocket } from "@/features/chat/hooks/useWebSocket";
import { instance as axios } from "@/shared/api/http";

/**
 * Hook para rastrear o status online de um usuário específico
 */
export const useOnlineStatus = (userId: number | undefined): boolean => {
  const [isOnline, setIsOnline] = useState(false);
  const { subscribeToUserStatus, isConnected } = useWebSocket();

  useEffect(() => {
    if (!userId || !isConnected) return;

    console.log(`👤 Buscando status inicial do usuário ${userId}`);

    // 1️⃣ Busca o status inicial via REST API
    const fetchInitialStatus = async () => {
      try {
        const response = await axios.get(`/users/${userId}/status`);
        const initialStatus = response.data.status;
        console.log(`🔍 Status inicial do usuário ${userId}: ${initialStatus}`);
        setIsOnline(initialStatus === "ONLINE");
      } catch (error) {
        console.warn(
          `⚠️ Erro ao buscar status inicial do usuário ${userId}:`,
          error,
        );
        setIsOnline(false);
      }
    };

    fetchInitialStatus();

    // 2️⃣ Inscreve-se no status do usuário para receber atualizações em tempo real
    console.log(`👤 Inscrevendo no status do usuário ${userId}`);
    const unsubscribe = subscribeToUserStatus(userId, (status) => {
      console.log(`📊 Status atualizado para usuário ${userId}: ${status}`);
      setIsOnline(status === "ONLINE");
    });

    return () => {
      console.log(`📴 Desinscrevendo do status do usuário ${userId}`);
      if (unsubscribe) unsubscribe();
      setIsOnline(false); // Reset ao desinscrever
    };
  }, [userId, subscribeToUserStatus, isConnected]);

  return isOnline;
};
