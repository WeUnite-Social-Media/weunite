import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das atividades da plataforma
          </p>
        </div>

        <DashboardOverview />
      </div>
    </AdminLayout>
  );
}
