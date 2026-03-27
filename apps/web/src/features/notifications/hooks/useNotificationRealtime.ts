import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppWebSocket } from "@/app/providers/useAppWebSocket";
import { notificationKeys } from "@/features/notifications/state/useNotifications";
import type {
  Notification,
  NotificationCount,
  NotificationResponse,
} from "@/features/notifications/types/notification.types";

export const useNotificationRealtime = (userId?: number) => {
  const queryClient = useQueryClient();
  const { isConnected, subscribe } = useAppWebSocket();

  useEffect(() => {
    if (!userId || !isConnected) {
      return;
    }

    return subscribe(`/topic/user/${userId}/notifications`, (messageBody) => {
      try {
        const notification = JSON.parse(messageBody) as Notification;

        queryClient.setQueryData<NotificationResponse<Notification[]>>(
          notificationKeys.list(userId),
          (currentData) => {
            const currentNotifications =
              currentData?.success && currentData.data ? currentData.data : [];

            if (
              currentNotifications.some(
                (currentNotification) => currentNotification.id === notification.id,
              )
            ) {
              return currentData;
            }

            return {
              success: true,
              data: [notification, ...currentNotifications],
              message: currentData?.message ?? null,
              error: null,
            };
          },
        );

        queryClient.setQueryData<NotificationResponse<NotificationCount>>(
          notificationKeys.unreadCount(userId),
          (currentData) => {
            const currentUnreadCount =
              currentData?.success && currentData.data
                ? currentData.data.unreadCount
                : 0;

            return {
              success: true,
              data: {
                unreadCount: notification.isRead
                  ? currentUnreadCount
                  : currentUnreadCount + 1,
              },
              message: currentData?.message ?? null,
              error: null,
            };
          },
        );

        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(userId),
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(userId),
          refetchType: "active",
        });
      } catch (error) {
        console.error("Erro ao processar notificacao em tempo real:", error);
      }
    });
  }, [isConnected, queryClient, subscribe, userId]);
};
