export type NotificationType =
  | "POST_LIKE"
  | "POST_COMMENT"
  | "COMMENT_LIKE"
  | "COMMENT_REPLY"
  | "NEW_FOLLOWER"
  | "NEW_MESSAGE"
  | "POST_REPOST"
  | "OPPORTUNITY_SUBSCRIPTION";

export type NotificationFilter =
  | "all"
  | "likes"
  | "comments"
  | "follows"
  | "messages"
  | "opportunities";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  actorId: number;
  actorName: string;
  actorUsername: string;
  actorProfileImg?: string;
  relatedEntityId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCount {
  unreadCount: number;
}

export interface NotificationResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}
