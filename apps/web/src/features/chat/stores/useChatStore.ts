import { create } from "zustand";

interface ChatState {
  isConversationOpen: boolean;
  pendingConversationId: number | null;
  clearPendingConversationId: () => void;
  setIsConversationOpen: (isOpen: boolean) => void;
  setPendingConversationId: (conversationId: number | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isConversationOpen: false,
  pendingConversationId: null,

  clearPendingConversationId: () =>
    set({
      pendingConversationId: null,
    }),

  setIsConversationOpen: (isOpen: boolean) =>
    set({
      isConversationOpen: isOpen,
    }),

  setPendingConversationId: (conversationId: number | null) =>
    set({
      pendingConversationId: conversationId,
    }),
}));
