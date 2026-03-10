import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Cartão de estatísticas do dashboard administrativo
 * Exibe métricas com indicador de tendência e comparação com período anterior
 *
 * @example
 * <StatsCard
 *   title="Total de Posts"
 *   value={1234}
 *   trend={12.5}
 *   icon={<FileText className="h-4 w-4" />}
 * />
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatsCard({
  title,
  value,
  previousValue,
  icon,
  trend,
}: StatsCardProps) {
  const formatTrend = (trend: number) => {
    const absValue = Math.abs(trend);
    return `${trend > 0 ? "+" : ""}${absValue.toFixed(1)}%`;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs mt-1 ${getTrendColor(trend)}`}
          >
            {trend > 0 ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="mr-1 h-3 w-3" />
            ) : null}
            <span className="font-medium">{formatTrend(trend)}</span>
            {previousValue && (
              <span className="text-muted-foreground ml-1">
                vs. mês anterior
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
