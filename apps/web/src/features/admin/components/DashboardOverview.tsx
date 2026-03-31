import { FileText, Briefcase, Users, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsRequest } from "@/features/admin/api/admin/dashboardService";
import { StatsCard } from "./StatsCard";
import { useTheme } from "@/shared/providers/ThemeProvider";
import type { CategoryData } from "@/shared/types/admin.types";
import type { DashboardData } from "@/shared/types/admin/dashboard.types";
import {
  getChartColors,
  calculateTrend,
} from "@/features/admin/utils/adminUtils";
import { MonthlyActivityChart } from "./charts/MonthlyActivityChart";
import { UserTypeDistributionChart } from "./charts/UserTypeDistributionChart";
import { OpportunityCategoryChart } from "./charts/OpportunityCategoryChart";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Visao geral do dashboard administrativo
 * Exibe cards de estatisticas e graficos de atividade da plataforma
 */
export function DashboardOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColors = getChartColors(isDark);
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const result = await getDashboardStatsRequest();

      if (!result.success || !result.data) {
        throw new Error(
          result.error || "Erro ao carregar estatisticas do dashboard",
        );
      }

      return result.data;
    },
  });

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Nao foi possivel carregar o dashboard."}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const { stats, monthlyActivity, opportunitiesByCategory, userTypeData } =
    dashboardData;

  const fills = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
    chartColors.danger,
  ];
  const categoryData: CategoryData[] = opportunitiesByCategory.map(
    (category, index) => ({
      category: category.category,
      count: category.count,
      fill: fills[index % fills.length],
    }),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Posts"
          value={stats.totalPosts.toLocaleString("pt-BR")}
          previousValue={stats.previousMonth.totalPosts}
          trend={calculateTrend(stats.totalPosts, stats.previousMonth.totalPosts)}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Oportunidades"
          value={stats.totalOpportunities.toLocaleString("pt-BR")}
          previousValue={stats.previousMonth.totalOpportunities}
          trend={calculateTrend(
            stats.totalOpportunities,
            stats.previousMonth.totalOpportunities,
          )}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Usuarios Ativos"
          value={stats.activeUsers.toLocaleString("pt-BR")}
          previousValue={stats.previousMonth.activeUsers}
          trend={calculateTrend(stats.activeUsers, stats.previousMonth.activeUsers)}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Taxa de Engajamento"
          value={`${stats.engagementRate.toFixed(1)}%`}
          previousValue={`${stats.previousMonth.engagementRate.toFixed(1)}%`}
          trend={calculateTrend(
            stats.engagementRate,
            stats.previousMonth.engagementRate,
          )}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyActivityChart data={monthlyActivity} colors={chartColors} />
        <UserTypeDistributionChart data={userTypeData} colors={chartColors} />
      </div>

      <OpportunityCategoryChart data={categoryData} />
    </div>
  );
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[360px] md:col-span-2" />
        <Skeleton className="h-[360px]" />
      </div>

      <Skeleton className="h-[360px]" />
    </div>
  );
}
