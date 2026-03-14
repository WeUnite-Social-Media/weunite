interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

export const TypingIndicator = ({
  isTyping,
  userName = "Fulano",
}: TypingIndicatorProps) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-fade-in">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs">{userName} está digitando...</span>
    </div>
  );
};
