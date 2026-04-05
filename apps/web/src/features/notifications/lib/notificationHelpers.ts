import { isThisWeek, isToday, isYesterday } from "date-fns";
import type {
  Notification,
  NotificationFilter,
} from "@/features/notifications/types/notification.types";

export interface NotificationsByPeriod {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

export const groupNotificationsByPeriod = (
  notifications: Notification[],
): NotificationsByPeriod => {
  return notifications.reduce<NotificationsByPeriod>(
    (groups, notification) => {
      const createdAt = new Date(notification.createdAt);

      if (isToday(createdAt)) {
        groups.today.push(notification);
      } else if (isYesterday(createdAt)) {
        groups.yesterday.push(notification);
      } else if (isThisWeek(createdAt)) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    },
  );
};

export const isNewNotification = (createdAt: string) => {
  const createdAtTime = new Date(createdAt).getTime();
  return Date.now() - createdAtTime < 5 * 60 * 1000;
};

export const matchesNotificationFilter = (
  notification: Notification,
  filter: NotificationFilter,
) => {
  if (filter === "all") {
    return true;
  }

  const filterMap: Record<Exclude<NotificationFilter, "all">, Notification["type"][]> = {
    likes: ["POST_LIKE", "COMMENT_LIKE"],
    comments: ["POST_COMMENT", "COMMENT_REPLY"],
    follows: ["NEW_FOLLOWER"],
    messages: ["NEW_MESSAGE"],
    opportunities: ["OPPORTUNITY_SUBSCRIPTION"],
  };

  return filterMap[filter].includes(notification.type);
};

export const getNotificationFilterLabel = (filter: NotificationFilter) => {
  switch (filter) {
    case "likes":
      return "Curtidas";
    case "comments":
      return "Comentarios";
    case "follows":
      return "Seguidores";
    case "messages":
      return "Mensagens";
    case "opportunities":
      return "Oportunidades";
    default:
      return "Todas";
  }
};
