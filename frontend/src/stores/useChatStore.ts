import { create } from "zustand";

interface ChatState {
  isConversationOpen: boolean;
  setIsConversationOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isConversationOpen: false,
  setIsConversationOpen: (isOpen: boolean) =>
    set({ isConversationOpen: isOpen }),
}));
