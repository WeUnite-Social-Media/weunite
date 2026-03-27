import { Badge } from "@/shared/components/ui/badge";

const reportReasonMap: Record<string, string> = {
  spam: "Spam",
  harassment: "Assédio",
  inappropriate_content: "Conteúdo inadequado",
  fake_profile: "Perfil falso",
  fake_opportunity: "Oportunidade falsa",
  copyright_violation: "Violação de direitos",
  violence: "Violência",
  hate_speech: "Discurso de ódio",
  misinformation: "Desinformação",
  scam: "Golpe",
  discrimination: "Discriminação",
  other: "Outros",
};

export function getReportReasonText(reason: string) {
  return reportReasonMap[reason] || reason;
}

export function getReportReasonBadge(reason: string) {
  return <Badge variant="outline">{getReportReasonText(reason)}</Badge>;
}

export function getReportStatusBadge(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "pending") {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30"
      >
        Pendente
      </Badge>
    );
  }

  if (normalizedStatus === "under_review" || normalizedStatus === "reviewed") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30"
      >
        Em análise
      </Badge>
    );
  }

  if (
    normalizedStatus === "resolved" ||
    normalizedStatus === "dismissed" ||
    normalizedStatus === "resolved_dismissed"
  ) {
    return (
      <Badge
        variant="outline"
        className="border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30"
      >
        Resolvida
      </Badge>
    );
  }

  if (normalizedStatus === "deleted") {
    return (
      <Badge
        variant="outline"
        className="border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30"
      >
        Deletado
      </Badge>
    );
  }

  if (normalizedStatus === "hidden") {
    return (
      <Badge
        variant="outline"
        className="border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30"
      >
        Oculto
      </Badge>
    );
  }

  return <Badge variant="secondary">{status}</Badge>;
}
