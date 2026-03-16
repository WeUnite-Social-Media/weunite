"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypingIndicator = void 0;
var TypingIndicator = function (_a) {
    var isTyping = _a.isTyping, _b = _a.userName, userName = _b === void 0 ? "Fulano" : _b;
    if (!isTyping)
        return null;
    return (<div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-fade-in">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs">{userName} está digitando...</span>
    </div>);
};
exports.TypingIndicator = TypingIndicator;
