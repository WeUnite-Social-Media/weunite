import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Ban,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type ReportType = "post" | "opportunity" | "user";
type ReportStatus = "pending" | "under_review" | "resolved" | "rejected";

interface Report {
  id: number;
  type: ReportType;
  targetName: string;
  targetInitials: string;
  reportedBy: string;
  reporterInitials: string;
  reason: string;
  description: string;
  status: ReportStatus;
  date: string;
  severity: "low" | "medium" | "high";
}

interface ReportDetailsDrawerProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: string) => void;
}

const statusLabels: Record<ReportStatus, string> = {
  pending: "Pendente",
  under_review: "Em análise",
  resolved: "Resolvida",
  rejected: "Rejeitada",
};

const typeLabels: Record<ReportType, string> = {
  post: "Post",
  opportunity: "Oportunidade",
  user: "Usuário",
};

export function ReportDetailsDrawer({
  report,
  open,
  onOpenChange,
  onAction,
}: ReportDetailsDrawerProps) {
  const [notes, setNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (!report) return null;

  const handleDeleteContent = () => {
    setShowDeleteDialog(false);
    onAction("delete");
  };

  const handleBanUser = () => {
    setShowBanDialog(false);
    onAction("ban");
  };

  const handleRejectReport = () => {
    setShowRejectDialog(false);
    onAction("reject");
  };

  const handleMarkReviewed = () => {
    onAction("mark_reviewed");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes da Denúncia #{report.id}</SheetTitle>
            <SheetDescription>
              Revise as informações e tome as ações necessárias
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Status e Tipo */}
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-muted-foreground mb-1">Tipo</p>
                <Badge variant="outline">{typeLabels[report.type]}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <Badge
                  variant={
                    report.status === "pending"
                      ? "default"
                      : report.status === "under_review"
                        ? "secondary"
                        : report.status === "resolved"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {statusLabels[report.status]}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Severidade</p>
                <div
                  className={`flex items-center gap-1 ${
                    report.severity === "high"
                      ? "text-red-600"
                      : report.severity === "medium"
                        ? "text-orange-600"
                        : "text-yellow-600"
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="capitalize">
                    {report.severity === "high"
                      ? "Alta"
                      : report.severity === "medium"
                        ? "Média"
                        : "Baixa"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Alvo da denúncia */}
            <div>
              <h4 className="mb-3">Conteúdo Denunciado</h4>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{report.targetInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{report.targetName}</p>
                    <p className="text-muted-foreground">{report.date}</p>
                  </div>
                </div>
                {report.type === "post" && (
                  <p className="mt-3 text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Denunciante */}
            <div>
              <h4 className="mb-3">Denunciado por</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{report.reporterInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p>{report.reportedBy}</p>
                  <p className="text-muted-foreground">Usuário verificado</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Motivo e Descrição */}
            <div>
              <h4 className="mb-2">Motivo da Denúncia</h4>
              <p className="text-muted-foreground mb-4">{report.reason}</p>

              <h4 className="mb-2">Descrição Detalhada</h4>
              <p className="text-muted-foreground">{report.description}</p>
            </div>

            <Separator />

            {/* Notas do Moderador */}
            <div>
              <Label htmlFor="notes">Notas do Moderador (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre esta denúncia..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <Separator />

            {/* Ações */}
            <div className="space-y-3">
              <h4>Ações</h4>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open("#", "_blank")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver {typeLabels[report.type]}
                </Button>

                {report.status === "pending" && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleMarkReviewed}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar em Análise
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteContent(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir {typeLabels[report.type]}
                </Button>

                {report.type === "user" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowBanDialog(true)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Banir Usuário
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar Denúncia
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogos de Confirmação */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir este{" "}
              {typeLabels[report.type].toLowerCase()}? Esta ação não pode ser
              desfeita e o conteúdo será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Banimento</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja banir este usuário? O usuário perderá
              acesso à plataforma e todo seu conteúdo será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Banir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Denúncia</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja rejeitar esta denúncia? A denúncia
              será marcada como não procedente e arquivada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectReport}>
              Rejeitar Denúncia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
