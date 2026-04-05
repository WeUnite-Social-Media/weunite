import type {
  TooltipPayloadEntry,
  TooltipProps,
} from "@/shared/types/admin.types";

/**
 * Tooltip customizado para graficos de linha e barra
 * Segue o padrao visual do shadcn/ui
 */
export function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-1 font-medium text-foreground">{label}</p>
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
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
 * Tooltip especifico para grafico de pizza
 * Mostra percentuais e formatacao especifica
 */
export function PieTooltip({
  active,
  payload,
  total = 0,
}: TooltipProps & { total?: number }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const safeTotal = total > 0 ? total : 1;

    return (
      <div className="rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-1 font-medium text-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value.toLocaleString()} usuarios
        </p>
        <p className="text-xs text-muted-foreground">
          {((data.value / safeTotal) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }

  return null;
}
