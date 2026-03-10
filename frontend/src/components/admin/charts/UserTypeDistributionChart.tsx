import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { UserTypeData, ChartColors } from "@/@types/admin.types";
import { PieTooltip } from "./ChartTooltips";

interface UserTypeDistributionChartProps {
  data: UserTypeData[];
  colors: ChartColors;
}

/**
 * Gráfico de pizza mostrando distribuição de tipos de usuário
 */
export function UserTypeDistributionChart({
  data,
  colors,
}: UserTypeDistributionChartProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-foreground">Tipos de Usuário</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição por categoria
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill={colors.primary} />
              <Cell fill={colors.secondary} />
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-sm text-foreground">Atletas</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.secondary }}
            />
            <span className="text-sm text-foreground">Empresas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
