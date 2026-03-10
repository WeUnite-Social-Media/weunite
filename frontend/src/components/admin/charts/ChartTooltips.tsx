import type { TooltipProps } from "@/@types/admin.types";

/**
 * Tooltip customizado para gráficos de linha e barra
 * Segue o padrão visual do shadcn/ui
 */
export function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Tooltip específico para gráfico de pizza
 * Mostra percentuais e formatação específica
 */
export function PieTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const totalUsers = 8500 + 3958; // TODO: Calcular dinamicamente

    return (
      <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value.toLocaleString()} usuários
        </p>
        <p className="text-xs text-muted-foreground">
          {((data.value / totalUsers) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}
