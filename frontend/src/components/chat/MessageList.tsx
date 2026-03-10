import { useEffect, useRef } from "react";
import { Message } from "@/components/chat/Message";

interface MessageType {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
  read: boolean;
}

interface MessageListProps {
  messages: MessageType[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="max-w-3xl mx-auto space-y-4 pb-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
