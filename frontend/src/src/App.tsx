import { useState } from "react";
import { AdminSidebar } from "./components/admin-sidebar";
import { DashboardStats } from "./components/dashboard-stats";
import { ActivityChart } from "./components/activity-chart";
import { CategoryChart } from "./components/category-chart";
import { RecentPostsTable } from "./components/recent-posts-table";
import { OpportunitiesTable } from "./components/opportunities-table";
import { ReportsView } from "./components/reports-view";
import { FileText, Briefcase, Users, TrendingUp } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    {
      title: "Total de Posts",
      value: "3,842",
      change: 12.5,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Oportunidades",
      value: "1,245",
      change: 8.3,
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      title: "Usuários Ativos",
      value: "12,458",
      change: 15.2,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Taxa de Engajamento",
      value: "68.4%",
      change: 5.1,
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === "dashboard" && (
            <>
              <div className="mb-8">
                <h1>Dashboard Administrativo</h1>
                <p className="text-muted-foreground">
                  Bem-vindo ao painel de controle da rede social
                </p>
              </div>

              <div className="space-y-6">
                <DashboardStats stats={stats} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <ActivityChart />
                  <CategoryChart />
                </div>

                <RecentPostsTable />

                <OpportunitiesTable />
              </div>
            </>
          )}

          {activeTab === "reports" && (
            <>
              <div className="mb-8">
                <h1>Gerenciar Denúncias</h1>
                <p className="text-muted-foreground">
                  Revise e tome ações sobre denúncias de posts, oportunidades e
                  usuários
                </p>
              </div>
              <ReportsView />
            </>
          )}

          {activeTab !== "dashboard" && activeTab !== "reports" && (
            <div className="mb-8">
              <h1>Em Desenvolvimento</h1>
              <p className="text-muted-foreground">
                Esta seção está sendo desenvolvida
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
