// Utility function to format chat timestamps for mobile-optimized display
export const formatChatTime = (time: string): string => {
  // Handle time formats like "12:30" vs relative times like "Ontem"
  if (time.includes(":")) {
    // It's a time like "12:30" - assume it's today
    return time;
  }

  // Handle relative times and make them more mobile-friendly
  const lowerTime = time.toLowerCase();

  if (lowerTime === "ontem") return "ontem";
  if (lowerTime === "seg") return "seg";
  if (lowerTime === "ter") return "ter";
  if (lowerTime === "qua") return "qua";
  if (lowerTime === "qui") return "qui";
  if (lowerTime === "sex") return "sex";
  if (lowerTime === "sáb") return "sáb";
  if (lowerTime === "dom") return "dom";

  return time; // Return as is for other formats
};

// Helper to determine time display style for mobile
export const getTimeDisplayProps = (time: string, unread: number) => {
  const isRecent = time.includes(":") || time.toLowerCase() === "agora";

  return {
    textClass:
      unread > 0 && isRecent
        ? "text-primary font-semibold text-xs"
        : unread > 0
          ? "text-primary font-medium text-xs"
          : "text-muted-foreground text-xs",
    showDot: unread > 0 && isRecent,
  };
};
