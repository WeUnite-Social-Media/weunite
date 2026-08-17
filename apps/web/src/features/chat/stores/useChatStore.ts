import { create } from "zustand";

interface ChatState {
  isConversationOpen: boolean;
  pendingConversationId: number | null;
  pendingMessageId: number | null;
  clearPendingConversationId: () => void;
  clearPendingMessageId: () => void;
  setIsConversationOpen: (isOpen: boolean) => void;
  setPendingConversationId: (conversationId: number | null) => void;
  setPendingMessageId: (messageId: number | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isConversationOpen: false,
  pendingConversationId: null,
  pendingMessageId: null,

  clearPendingConversationId: () =>
    set({
      pendingConversationId: null,
    }),

  clearPendingMessageId: () =>
    set({
      pendingMessageId: null,
    }),

  setIsConversationOpen: (isOpen: boolean) =>
    set({
      isConversationOpen: isOpen,
    }),

  setPendingConversationId: (conversationId: number | null) =>
    set({
      pendingConversationId: conversationId,
    }),

  setPendingMessageId: (messageId: number | null) =>
    set({
      pendingMessageId: messageId,
    }),
}));
