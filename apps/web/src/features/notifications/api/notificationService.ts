import { instance as axios } from "@/shared/api/http";
import type {
  Notification,
  NotificationCount,
  NotificationResponse,
} from "@/features/notifications/types/notification.types";
import { AxiosError } from "axios";

const buildErrorResponse = (
  error: unknown,
  fallbackMessage: string,
): NotificationResponse<never> => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return {
    success: false,
    data: null,
    message: null,
    error: axiosError.response?.data?.message || fallbackMessage,
  };
};

export const getNotificationsRequest = async (
  userId: number,
): Promise<NotificationResponse<Notification[]>> => {
  try {
    const response = await axios.get(`/notifications/user/${userId}`);

    return {
      success: true,
      data: response.data as Notification[],
      message: "Notificacoes carregadas com sucesso!",
      error: null,
    };
  } catch (error) {
    return buildErrorResponse(error, "Erro ao carregar notificacoes");
  }
};

export const getUnreadCountRequest = async (
  userId: number,
): Promise<NotificationResponse<NotificationCount>> => {
  try {
    const response = await axios.get(`/notifications/user/${userId}/unread-count`);

    return {
      success: true,
      data: response.data as NotificationCount,
      message: "Contador carregado com sucesso!",
      error: null,
    };
  } catch (error) {
    return buildErrorResponse(error, "Erro ao carregar contador");
  }
};

export const markNotificationAsReadRequest = async (
  notificationId: number,
): Promise<NotificationResponse<null>> => {
  try {
    await axios.put(`/notifications/${notificationId}/read`);

    return {
      success: true,
      data: null,
      message: "Notificacao marcada como lida!",
      error: null,
    };
  } catch (error) {
    return buildErrorResponse(error, "Erro ao marcar notificacao como lida");
  }
};

export const markAllNotificationsAsReadRequest = async (
  userId: number,
): Promise<NotificationResponse<null>> => {
  try {
    await axios.put(`/notifications/user/${userId}/read-all`);

    return {
      success: true,
      data: null,
      message: "Todas as notificacoes foram marcadas como lidas!",
      error: null,
    };
  } catch (error) {
    return buildErrorResponse(error, "Erro ao marcar notificacoes como lidas");
  }
};

export const deleteNotificationRequest = async (
  notificationId: number,
): Promise<NotificationResponse<null>> => {
  try {
    await axios.delete(`/notifications/${notificationId}`);

    return {
      success: true,
      data: null,
      message: "Notificacao removida com sucesso!",
      error: null,
    };
  } catch (error) {
    return buildErrorResponse(error, "Erro ao remover notificacao");
  }
};
