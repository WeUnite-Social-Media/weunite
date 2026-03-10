import { useState } from "react";
import { Check, FileText, Download, Play, Pause } from "lucide-react";
import { ImageModal } from "@/components/chat/ImageModal";

interface MessageType {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
  read: boolean;
}

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const isSender = message.sender === "me";
  const [showImageModal, setShowImageModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const isImageUrl = (text: string) => {
    return text.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const isAudioUrl = (text: string) => {
    return text.match(/\.(mp3|wav|ogg|m4a|webm)$/i);
  };

  const isFileUrl = (text: string) => {
    return text.startsWith("/uploads/") || text.startsWith("http");
  };

  const getFileName = (url: string) => {
    return url.split("/").pop() || "arquivo";
  };

  const hasImage = isFileUrl(message.text) && isImageUrl(message.text);

  const handleAudioPlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderContent = () => {
    if (isFileUrl(message.text)) {
      const fullUrl = `http://localhost:8080${message.text}`;

      if (isImageUrl(message.text)) {
        return (
          <>
            <div className="w-[240px] md:w-[280px] h-[240px] md:h-[280px]">
              <img
                src={fullUrl}
                alt="Imagem enviada"
                className="rounded-lg w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity hover:scale-[1.02] duration-200"
                onClick={() => setShowImageModal(true)}
              />
            </div>
            {showImageModal && (
              <ImageModal
                imageUrl={fullUrl}
                onClose={() => setShowImageModal(false)}
              />
            )}
          </>
        );
      } else if (isAudioUrl(message.text)) {
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              onClick={handleAudioPlayPause}
              className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-1">
              <audio
                ref={setAudioRef}
                src={fullUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="w-full"
                controls
              />
            </div>
          </div>
        );
      } else {
        return (
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <FileText size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getFileName(message.text)}
              </p>
              <p className="text-xs opacity-70">Clique para baixar</p>
            </div>
            <Download size={16} />
          </a>
        );
      }
    }

    return (
      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
    );
  };

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[80%] ${isSender ? "order-1" : "order-2"}`}
      >
        <div
          className={`${hasImage ? "p-1" : "p-2 md:p-3"} rounded-lg ${
            isSender
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card text-card-foreground rounded-bl-none border border-border"
          }`}
        >
          {renderContent()}
        </div>
        <div
          className={`flex items-center mt-1 text-xs text-muted-foreground ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <span>{message.time}</span>
          {isSender && (
            <span className="ml-1 flex items-center">
              <Check size={12} className={message.read ? "text-primary" : ""} />
              <Check
                size={12}
                className={`-ml-1 ${message.read ? "text-primary" : ""}`}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
