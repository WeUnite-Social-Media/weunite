import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Heart, Image } from "lucide-react";
import type { ReportedPost } from "@/@types/report.types";

/**
 * Componente de linha da tabela de posts denunciados
 * Exibe informações resumidas de um post reportado com ações de moderação
 */
interface TableReportRowProps {
  reportedPost: ReportedPost;
  onReview: (reportedPost: ReportedPost) => void;
  getTimeAgo: (date: string) => string;
}

export function TableReportRow({
  reportedPost,
  onReview,
  getTimeAgo,
}: TableReportRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-600";
      case "hidden":
        return "border-orange-500 text-orange-600";
      case "deleted":
        return "border-red-500 text-red-600";
      default:
        return "border-gray-500 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "hidden":
        return "Oculto";
      case "deleted":
        return "Deletado";
      default:
        return status;
    }
  };

  return (
    <TableRow key={reportedPost.post.id}>
      <TableCell className="max-w-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {reportedPost.post.user.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {reportedPost.post.text}
          </p>
          {reportedPost.post.imageUrl && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Image className="h-3 w-3" />
              <span>Com mídia</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="destructive" className="bg-red-600">
          {reportedPost.totalReports} denúncias
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-500" />
            <span>{reportedPost.post.likes?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{reportedPost.post.comments?.length || 0}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={getStatusBadge(reportedPost.status)}
        >
          {getStatusText(reportedPost.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {getTimeAgo(reportedPost.post.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReview(reportedPost)}
          >
            Revisar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
