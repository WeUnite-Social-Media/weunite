import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { AlertTriangle, CheckCircle, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Report } from "@/shared/types/admin.types";
import {
  dismissReportsRequest,
  markReportsAsReviewedRequest,
  resolveReportsRequest,
} from "@/features/admin/api/adminService";
import { getReportReasonText } from "@/features/admin/utils/adminBadges";

interface ReportDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onActionComplete?: () => void;
}

export function ReportDetailsModal({
  isOpen,
  onOpenChange,
  report,
  onActionComplete,
}: ReportDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!report) {
    return null;
  }

  const getReportTarget = () => {
    if (
      report.entityId === undefined ||
      (report.entityType !== "POST" &&
        report.entityType !== "OPPORTUNITY" &&
        report.entityType !== "COMMENT")
    ) {
      toast.error("Não foi possível identificar a entidade reportada.");
      return null;
    }

    return {
      entityId: report.entityId,
      entityType: report.entityType,
    };
  };

  const handleResolve = async () => {
    const target = getReportTarget();
    if (!target) {
      return;
    }

    setIsLoading(true);
    const response = await resolveReportsRequest(
      target.entityId,
      target.entityType,
    );
    setIsLoading(false);

    if (response.success) {
      toast.success(response.message || "Denúncia resolvida com sucesso!");
      onOpenChange(false);
      onActionComplete?.();
      return;
    }

    toast.error(response.error || "Erro ao resolver denúncia");
  };

  const handleReject = async () => {
    const target = getReportTarget();
    if (!target) {
      return;
    }

    setIsLoading(true);
    const response = await dismissReportsRequest(
      target.entityId,
      target.entityType,
    );
    setIsLoading(false);

    if (response.success) {
      toast.success(response.message || "Denúncia rejeitada com sucesso!");
      onOpenChange(false);
      onActionComplete?.();
      return;
    }

    toast.error(response.error || "Erro ao rejeitar denúncia");
  };

  const handleAnalyze = async () => {
    const target = getReportTarget();
    if (!target) {
      return;
    }

    setIsLoading(true);
    const response = await markReportsAsReviewedRequest(
      target.entityId,
      target.entityType,
    );
    setIsLoading(false);

    if (response.success) {
      toast.success(response.message || "Denúncia marcada como em análise!");
      onOpenChange(false);
      onActionComplete?.();
      return;
    }

    toast.error(response.error || "Erro ao marcar denúncia como em análise");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Detalhes da Denúncia</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Revise as informações e tome as ações necessárias.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Denunciante
              </h4>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={report.reportedBy.profileImg} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.reportedBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{report.reportedBy.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Denunciado
              </h4>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={report.reportedUser.profileImg} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.reportedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{report.reportedUser.username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Motivo</h4>
              <Badge variant="outline" className="text-sm">
                {getReportReasonText(report.reason)}
              </Badge>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Descrição</h4>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm">{report.description}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Conteúdo reportado</h4>
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                {report.content ? (
                  <p className="text-sm text-muted-foreground">
                    {report.content}
                  </p>
                ) : null}
                {report.imageUrl ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={report.imageUrl}
                      alt="Conteúdo reportado"
                      className="max-h-96 h-auto w-full object-cover"
                    />
                  </div>
                ) : null}
                {!report.content && !report.imageUrl ? (
                  <p className="text-sm italic text-muted-foreground">
                    Nenhum conteúdo disponível
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data:</span>
              <span className="ml-2 font-medium">
                {new Date(report.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 font-mono text-xs">#{report.id}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3 text-sm font-medium">Ações de moderação</h4>
            <div className="space-y-2">
              {report.status === "pending" ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  <AlertTriangle className="h-4 w-4" />
                  {isLoading ? "Processando..." : "Marcar como em análise"}
                </Button>
              ) : null}

              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:border-green-200 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                onClick={handleResolve}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4" />
                {isLoading ? "Processando..." : "Resolver denúncia"}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                onClick={handleReject}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4" />
                {isLoading ? "Processando..." : "Rejeitar denúncia"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
