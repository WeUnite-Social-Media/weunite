import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createReportRequest } from "@/api/services/reportService";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "POST" | "OPPORTUNITY";
  entityId: number;
  entityTitle?: string;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam ou conteúdo enganoso" },
  { value: "harassment", label: "Assédio ou bullying" },
  { value: "inappropriate_content", label: "Conteúdo inadequado ou ofensivo" },
  { value: "fake_profile", label: "Perfil falso" },
  { value: "fake_opportunity", label: "Oportunidade falsa" },
  { value: "copyright_violation", label: "Violação de direitos autorais" },
  { value: "violence", label: "Violência ou ameaças" },
  { value: "hate_speech", label: "Discurso de ódio" },
  { value: "misinformation", label: "Desinformação" },
  { value: "other", label: "Outros" },
];

export function ReportModal({
  isOpen,
  onOpenChange,
  entityType,
  entityId,
  entityTitle,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Por favor, selecione um motivo para a denúncia");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para fazer uma denúncia");
      return;
    }

    setIsSubmitting(true);

    const response = await createReportRequest(Number(user.id), {
      type: entityType,
      entityId: entityId,
      reason: description || reason,
    });

    setIsSubmitting(false);

    if (response.success) {
      toast.success(
        response.message ||
          "Denúncia enviada com sucesso! Nossa equipe irá analisá-la em breve.",
      );
      setReason("");
      setDescription("");
      onOpenChange(false);
    } else {
      toast.error(`Erro ao enviar denúncia: ${response.error}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Denunciar {entityType === "POST" ? "Post" : "Oportunidade"}
          </DialogTitle>
          <DialogDescription>
            Sua denúncia será analisada pela nossa equipe. Use este recurso
            apenas para conteúdos que violem nossas diretrizes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {entityTitle && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Denunciando: <span className="font-medium">{entityTitle}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da denúncia *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detalhes adicionais (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione mais informações sobre a denúncia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 caracteres
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Aviso:</strong> Denúncias falsas podem resultar em
              penalidades para sua conta.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !reason}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Denúncia"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
