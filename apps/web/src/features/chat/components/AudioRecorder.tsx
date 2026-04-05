import { useState, useRef } from "react";
import { Mic, Square, Trash2, Send } from "lucide-react";

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob) => void;
}

export const AudioRecorder = ({ onSendAudio }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      alert("Não foi possível acessar o microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleSendAudio = () => {
    if (audioBlob) {
      onSendAudio(audioBlob);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <audio
          src={URL.createObjectURL(audioBlob)}
          controls
          className="h-9 w-[180px] sm:w-[240px]"
        />
        <button
          onClick={cancelRecording}
          className="p-2 hover:bg-destructive/10 rounded-full transition-colors shrink-0"
        >
          <Trash2 size={18} className="text-destructive" />
        </button>
        <button
          onClick={handleSendAudio}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors shrink-0"
        >
          <Send size={18} className="text-primary" />
        </button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full border border-destructive">
        <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse shrink-0" />
        <span className="text-xs sm:text-sm font-medium min-w-[40px]">
          {formatTime(recordingTime)}
        </span>
        <button
          onClick={stopRecording}
          className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shrink-0"
        >
          <Square size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className="p-2 hover:bg-primary/10 rounded-full transition-colors shrink-0"
      title="Gravar áudio"
    >
      <Mic size={20} className="text-primary" />
    </button>
  );
};
