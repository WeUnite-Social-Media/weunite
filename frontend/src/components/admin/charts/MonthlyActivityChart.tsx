import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint, ChartColors } from "@/@types/admin.types";
import { CustomTooltip } from "./ChartTooltips";

interface MonthlyActivityChartProps {
  data: ChartDataPoint[];
  colors: ChartColors;
}

/**
 * Gráfico de atividade mensal mostrando posts e oportunidades
 */
export function MonthlyActivityChart({
  data,
  colors,
}: MonthlyActivityChartProps) {
  return (
    <Card className="md:col-span-2 hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-foreground">Atividade Mensal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Posts e oportunidades criados por mês
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="posts"
              stroke={colors.primary}
              strokeWidth={3}
              name="Posts"
              dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="opportunities"
              stroke={colors.secondary}
              strokeWidth={3}
              name="Oportunidades"
              dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors.secondary, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
