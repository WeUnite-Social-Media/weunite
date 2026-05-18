import { useEffect, useMemo, useRef } from "react";
import { Message } from "@/features/chat/components/Message";

interface MessageType {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
  read: boolean;
}

interface MessageListProps {
  messages: MessageType[];
  highlightedMessageId?: number | null;
  autoScrollToBottom?: boolean;
}

export const MessageList = ({
  messages,
  highlightedMessageId,
  autoScrollToBottom = true,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const highlightedMessage = useMemo(
    () => messages.find((message) => message.id === highlightedMessageId),
    [highlightedMessageId, messages],
  );

  useEffect(() => {
    if (!autoScrollToBottom) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [autoScrollToBottom, messages]);

  useEffect(() => {
    if (!highlightedMessageId || !highlightedMessage) {
      return;
    }

    const highlightedElement = messageRefs.current.get(highlightedMessageId);

    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedMessage, highlightedMessageId]);

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="max-w-3xl mx-auto space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            ref={(element) => {
              messageRefs.current.set(message.id, element);
            }}
          >
            <Message
              message={message}
              highlighted={message.id === highlightedMessageId}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
