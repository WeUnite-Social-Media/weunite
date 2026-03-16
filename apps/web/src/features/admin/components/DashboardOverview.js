"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardOverview = DashboardOverview;
var StatsCard_1 = require("./StatsCard");
var lucide_react_1 = require("lucide-react");
var ThemeProvider_1 = require("@/shared/providers/ThemeProvider");
var adminUtils_1 = require("@/features/admin/utils/adminUtils");
var adminMockData_1 = require("@/features/admin/constants/adminMockData");
var MonthlyActivityChart_1 = require("./charts/MonthlyActivityChart");
var UserTypeDistributionChart_1 = require("./charts/UserTypeDistributionChart");
var OpportunityCategoryChart_1 = require("./charts/OpportunityCategoryChart");
/**
 * Visão geral do dashboard administrativo
 * Exibe cards de estatísticas e gráficos de atividade da plataforma
 */
function DashboardOverview() {
    var theme = (0, ThemeProvider_1.useTheme)().theme;
    var isDark = theme === "dark";
    var chartColors = (0, adminUtils_1.getChartColors)(isDark);
    // Dados de categoria com cores aplicadas dinamicamente
    var categoryData = [
        { category: "Tecnologia", count: 189, fill: chartColors.primary },
        { category: "Marketing", count: 145, fill: chartColors.secondary },
        { category: "Design", count: 123, fill: chartColors.tertiary },
        { category: "Vendas", count: 98, fill: chartColors.quaternary },
        { category: "Outros", count: 67, fill: chartColors.danger },
    ];
    return (<div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard_1.StatsCard title="Total de Posts" value={adminMockData_1.MOCK_ADMIN_STATS.totalPosts.toLocaleString()} trend={(0, adminUtils_1.calculateTrend)(adminMockData_1.MOCK_ADMIN_STATS.totalPosts, adminMockData_1.MOCK_ADMIN_STATS.previousMonth.totalPosts)} icon={<lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>}/>
        <StatsCard_1.StatsCard title="Oportunidades" value={adminMockData_1.MOCK_ADMIN_STATS.totalOpportunities.toLocaleString()} trend={(0, adminUtils_1.calculateTrend)(adminMockData_1.MOCK_ADMIN_STATS.totalOpportunities, adminMockData_1.MOCK_ADMIN_STATS.previousMonth.totalOpportunities)} icon={<lucide_react_1.Briefcase className="h-4 w-4 text-muted-foreground"/>}/>
        <StatsCard_1.StatsCard title="Usuários Ativos" value={adminMockData_1.MOCK_ADMIN_STATS.activeUsers.toLocaleString()} trend={(0, adminUtils_1.calculateTrend)(adminMockData_1.MOCK_ADMIN_STATS.activeUsers, adminMockData_1.MOCK_ADMIN_STATS.previousMonth.activeUsers)} icon={<lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>}/>
        <StatsCard_1.StatsCard title="Taxa de Engajamento" value={"".concat(adminMockData_1.MOCK_ADMIN_STATS.engagementRate, "%")} trend={(0, adminUtils_1.calculateTrend)(adminMockData_1.MOCK_ADMIN_STATS.engagementRate, adminMockData_1.MOCK_ADMIN_STATS.previousMonth.engagementRate)} icon={<lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>}/>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyActivityChart_1.MonthlyActivityChart data={adminMockData_1.MOCK_MONTHLY_DATA} colors={chartColors}/>

        <UserTypeDistributionChart_1.UserTypeDistributionChart data={adminMockData_1.MOCK_USER_TYPE_DATA} colors={chartColors}/>
      </div>

      <OpportunityCategoryChart_1.OpportunityCategoryChart data={categoryData}/>
    </div>);
}
