import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const data = [
  { category: "Tecnologia", count: 186 },
  { category: "Marketing", count: 145 },
  { category: "Design", count: 132 },
  { category: "Vendas", count: 98 },
  { category: "Finanças", count: 87 },
  { category: "RH", count: 65 },
];

const chartConfig = {
  count: {
    label: "Oportunidades",
    color: "hsl(var(--chart-3))",
  },
};

export function CategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oportunidades por Categoria</CardTitle>
        <CardDescription>Distribuição de vagas por área</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
