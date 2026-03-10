import { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, X, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { useUploadMessageFile } from "@/state/useChat";
import { toast } from "sonner";
import { AudioRecorder } from "@/components/chat/AudioRecorder";

interface MessageInputProps {
  conversationId: number;
  senderId: number;
  onSendMessage: (message: string, type?: string) => void;
}

interface FilePreview {
  file: File;
  preview?: string;
  type: "image" | "file";
}

export const MessageInput = ({
  conversationId,
  senderId,
  onSendMessage,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMessageFile();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ Fecha o emoji picker ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = message;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      const newMessage = before + emojiData.emoji + after;
      setMessage(newMessage);

      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + emojiData.emoji.length;
          textareaRef.current.selectionStart = newCursorPos;
          textareaRef.current.selectionEnd = newCursorPos;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter((file) => file.size > maxSize);

    if (invalidFiles.length > 0) {
      toast.error("Alguns arquivos excedem 10MB");
      return;
    }

    const newFiles: FilePreview[] = files.map((file) => {
      const isImage = file.type.startsWith("image/");

      return {
        file,
        type: isImage ? "image" : "file",
        preview: isImage ? URL.createObjectURL(file) : undefined,
      };
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];

      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return newFiles;
    });
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    try {
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const result = await uploadMutation.mutateAsync({
        conversationId,
        senderId,
        file: audioFile,
        fileType: "audio",
      });

      if (result.success && result.data) {
        onSendMessage(result.data.fileUrl, "AUDIO");
      }
    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      toast.error("Erro ao enviar áudio");
    }
  };

  const handleSend = async () => {
    if (selectedFiles.length > 0) {
      for (const filePreview of selectedFiles) {
        try {
          const result = await uploadMutation.mutateAsync({
            conversationId,
            senderId,
            file: filePreview.file,
          });

          if (result.success && result.data) {
            onSendMessage(
              result.data.fileUrl,
              filePreview.type === "image" ? "IMAGE" : "FILE",
            );
          }
        } catch (error) {
          console.error("Erro ao enviar arquivo:", error);
        }
      }

      selectedFiles.forEach((fp) => {
        if (fp.preview) URL.revokeObjectURL(fp.preview);
      });
      setSelectedFiles([]);
    }

    if (message.trim()) {
      onSendMessage(message.trim(), "TEXT");
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="p-3 md:p-3 border-t border-border bg-card relative">
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 max-w-3xl mx-auto">
          {selectedFiles.map((filePreview, index) => (
            <div
              key={index}
              className="relative rounded-lg border bg-muted p-2 flex items-center gap-2"
            >
              {filePreview.type === "image" && filePreview.preview ? (
                <img
                  src={filePreview.preview}
                  alt={filePreview.file.name}
                  className="h-16 w-16 rounded object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-muted-foreground/10 flex items-center justify-center">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(filePreview.file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 max-w-3xl mx-auto">
        <div className="relative shrink-0">
          <Button
            ref={emojiButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={showEmojiPicker ? "bg-accent" : ""}
          >
            <Smile size={20} />
          </Button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full left-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.AUTO}
                width={window.innerWidth < 400 ? 280 : 320}
                height={400}
                searchPlaceHolder="Pesquisar emoji..."
                previewConfig={{
                  showPreview: false,
                }}
                lazyLoadEmojis={true}
              />
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="shrink-0"
        >
          <Paperclip size={20} />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 min-h-[40px] max-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Digite sua mensagem..."
          rows={1}
        />
        {message.trim() || selectedFiles.length > 0 ? (
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={uploadMutation.isPending}
            className="shrink-0"
          >
            <Send size={18} />
          </Button>
        ) : (
          <AudioRecorder onSendAudio={handleSendAudio} />
        )}
      </div>

      {uploadMutation.isPending && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enviando arquivo...
        </p>
      )}
    </div>
  );
};
