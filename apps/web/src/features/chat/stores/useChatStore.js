"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatStore = void 0;
var zustand_1 = require("zustand");
exports.useChatStore = (0, zustand_1.create)(function (set) { return ({
    isConversationOpen: false,
    setIsConversationOpen: function (isOpen) {
        return set({ isConversationOpen: isOpen });
    },
}); });
