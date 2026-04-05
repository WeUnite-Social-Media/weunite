import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { DashboardOverview } from "@/features/admin/components/DashboardOverview";

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
