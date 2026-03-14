export type MessageType = "TEXT" | "IMAGE" | "FILE";

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  type: MessageType;
}

export interface Conversation {
  id: number;
  participantIds: number[];
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

export interface CreateConversation {
  initiatorUserId: number;
  participantIds: number[];
}

export interface SendMessage {
  conversationId: number;
  senderId: number;
  content: string;
  type?: MessageType;
}

export interface MarkAsRead {
  conversationId: number;
  userId: number;
}
