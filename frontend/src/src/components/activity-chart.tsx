import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", posts: 186, opportunities: 80 },
  { month: "Fev", posts: 305, opportunities: 120 },
  { month: "Mar", posts: 237, opportunities: 95 },
  { month: "Abr", posts: 273, opportunities: 140 },
  { month: "Mai", posts: 309, opportunities: 165 },
  { month: "Jun", posts: 214, opportunities: 110 },
  { month: "Jul", posts: 287, opportunities: 135 },
  { month: "Ago", posts: 345, opportunities: 178 },
  { month: "Set", posts: 412, opportunities: 198 },
  { month: "Out", posts: 389, opportunities: 185 },
];

const chartConfig = {
  posts: {
    label: "Posts",
    color: "hsl(var(--chart-1))",
  },
  opportunities: {
    label: "Oportunidades",
    color: "hsl(var(--chart-2))",
  },
};

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Mensal</CardTitle>
        <CardDescription>Posts e oportunidades criadas por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="posts"
              stackId="1"
              stroke="var(--color-posts)"
              fill="var(--color-posts)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="opportunities"
              stackId="2"
              stroke="var(--color-opportunities)"
              fill="var(--color-opportunities)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
