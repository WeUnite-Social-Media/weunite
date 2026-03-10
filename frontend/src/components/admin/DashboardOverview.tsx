import { StatsCard } from "./StatsCard";
import { FileText, Briefcase, Users, TrendingUp } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { CategoryData } from "@/@types/admin.types";
import { getChartColors, calculateTrend } from "@/utils/adminUtils";
import {
  MOCK_ADMIN_STATS,
  MOCK_MONTHLY_DATA,
  MOCK_USER_TYPE_DATA,
} from "@/constants/adminMockData";
import { MonthlyActivityChart } from "./charts/MonthlyActivityChart";
import { UserTypeDistributionChart } from "./charts/UserTypeDistributionChart";
import { OpportunityCategoryChart } from "./charts/OpportunityCategoryChart";

/**
 * Visão geral do dashboard administrativo
 * Exibe cards de estatísticas e gráficos de atividade da plataforma
 */
export function DashboardOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColors = getChartColors(isDark);

  // Dados de categoria com cores aplicadas dinamicamente
  const categoryData: CategoryData[] = [
    { category: "Tecnologia", count: 189, fill: chartColors.primary },
    { category: "Marketing", count: 145, fill: chartColors.secondary },
    { category: "Design", count: 123, fill: chartColors.tertiary },
    { category: "Vendas", count: 98, fill: chartColors.quaternary },
    { category: "Outros", count: 67, fill: chartColors.danger },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Posts"
          value={MOCK_ADMIN_STATS.totalPosts.toLocaleString()}
          trend={calculateTrend(
            MOCK_ADMIN_STATS.totalPosts,
            MOCK_ADMIN_STATS.previousMonth.totalPosts,
          )}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Oportunidades"
          value={MOCK_ADMIN_STATS.totalOpportunities.toLocaleString()}
          trend={calculateTrend(
            MOCK_ADMIN_STATS.totalOpportunities,
            MOCK_ADMIN_STATS.previousMonth.totalOpportunities,
          )}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Usuários Ativos"
          value={MOCK_ADMIN_STATS.activeUsers.toLocaleString()}
          trend={calculateTrend(
            MOCK_ADMIN_STATS.activeUsers,
            MOCK_ADMIN_STATS.previousMonth.activeUsers,
          )}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Taxa de Engajamento"
          value={`${MOCK_ADMIN_STATS.engagementRate}%`}
          trend={calculateTrend(
            MOCK_ADMIN_STATS.engagementRate,
            MOCK_ADMIN_STATS.previousMonth.engagementRate,
          )}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyActivityChart data={MOCK_MONTHLY_DATA} colors={chartColors} />

        <UserTypeDistributionChart
          data={MOCK_USER_TYPE_DATA}
          colors={chartColors}
        />
      </div>

      <OpportunityCategoryChart data={categoryData} />
    </div>
  );
}
