import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { ReportsView } from "@/features/admin/components/ReportsView";

export function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Denúncias</h1>
            <p className="text-muted-foreground">
              Gerencie denúncias e relatórios da plataforma.
            </p>
          </div>
        </div>

        <ReportsView />
      </div>
    </AdminLayout>
  );
}
