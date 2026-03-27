import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteNotificationRequest,
  getNotificationsRequest,
  getUnreadCountRequest,
  markAllNotificationsAsReadRequest,
  markNotificationAsReadRequest,
} from "@/features/notifications/api/notificationService";
import type {
  Notification,
  NotificationCount,
  NotificationResponse,
} from "@/features/notifications/types/notification.types";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (userId: number) => [...notificationKeys.lists(), userId] as const,
  unreadCount: (userId: number) =>
    [...notificationKeys.all, "unread-count", userId] as const,
};

const markNotificationAsReadInCache = (
  currentData: NotificationResponse<Notification[]> | undefined,
  notificationId: number,
) => {
  if (!currentData?.success || !currentData.data) {
    return currentData;
  }

  return {
    ...currentData,
    data: currentData.data.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification,
    ),
  };
};

const setUnreadCountInCache = (
  currentData: NotificationResponse<NotificationCount> | undefined,
  unreadCount: number,
) => {
  return {
    success: true,
    data: {
      unreadCount: Math.max(0, unreadCount),
    },
    message: currentData?.message ?? null,
    error: null,
  };
};

export const useGetNotifications = (userId: number) => {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => getNotificationsRequest(userId),
    enabled: userId > 0,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 2,
  });
};

export const useGetUnreadCount = (userId: number) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => getUnreadCountRequest(userId),
    enabled: userId > 0,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 2,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
    }: {
      userId: number;
      notificationId: number;
    }) => markNotificationAsReadRequest(notificationId),
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.error || "Erro ao marcar notificacao como lida");
        return;
      }

      queryClient.setQueryData<NotificationResponse<Notification[]>>(
        notificationKeys.list(variables.userId),
        (currentData) =>
          markNotificationAsReadInCache(currentData, variables.notificationId),
      );

      queryClient.setQueryData<NotificationResponse<NotificationCount>>(
        notificationKeys.unreadCount(variables.userId),
        (currentData) =>
          setUnreadCountInCache(
            currentData,
            (currentData?.data?.unreadCount ?? 0) - 1,
          ),
      );

      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(variables.userId),
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: number }) =>
      markAllNotificationsAsReadRequest(userId),
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.error || "Erro ao marcar notificacoes como lidas");
        return;
      }

      toast.success(result.message || "Todas as notificacoes foram lidas!");

      queryClient.setQueryData<NotificationResponse<Notification[]>>(
        notificationKeys.list(variables.userId),
        (currentData) => {
          if (!currentData?.success || !currentData.data) {
            return currentData;
          }

          return {
            ...currentData,
            data: currentData.data.map((notification) => ({
              ...notification,
              isRead: true,
            })),
          };
        },
      );

      queryClient.setQueryData<NotificationResponse<NotificationCount>>(
        notificationKeys.unreadCount(variables.userId),
        (currentData) => setUnreadCountInCache(currentData, 0),
      );
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
    }: {
      userId: number;
      notificationId: number;
    }) => deleteNotificationRequest(notificationId),
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.error || "Erro ao remover notificacao");
        return;
      }

      queryClient.setQueryData<NotificationResponse<Notification[]>>(
        notificationKeys.list(variables.userId),
        (currentData) => {
          if (!currentData?.success || !currentData.data) {
            return currentData;
          }

          const removedNotification = currentData.data.find(
            (notification) => notification.id === variables.notificationId,
          );

          queryClient.setQueryData<NotificationResponse<NotificationCount>>(
            notificationKeys.unreadCount(variables.userId),
            (currentCountData) =>
              setUnreadCountInCache(
                currentCountData,
                (currentCountData?.data?.unreadCount ?? 0) -
                  (removedNotification?.isRead ? 0 : 1),
              ),
          );

          return {
            ...currentData,
            data: currentData.data.filter(
              (notification) => notification.id !== variables.notificationId,
            ),
          };
        },
      );

      toast.success(result.message || "Notificacao removida!");
    },
  });
};
