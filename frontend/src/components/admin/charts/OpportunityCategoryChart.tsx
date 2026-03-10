import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CategoryData } from "@/@types/admin.types";
import { CustomTooltip } from "./ChartTooltips";

interface OpportunityCategoryChartProps {
  data: CategoryData[];
}

/**
 * Gráfico de barras mostrando oportunidades por categoria
 */
export function OpportunityCategoryChart({
  data,
}: OpportunityCategoryChartProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-foreground">
          Oportunidades por Categoria
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de vagas por área de atuação
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="category"
              className="text-xs fill-muted-foreground"
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
