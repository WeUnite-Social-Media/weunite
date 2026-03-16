"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardPage = AdminDashboardPage;
var AdminLayout_1 = require("@/features/admin/components/AdminLayout");
var DashboardOverview_1 = require("@/features/admin/components/DashboardOverview");
function AdminDashboardPage() {
    return (<AdminLayout_1.AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das atividades da plataforma
          </p>
        </div>

        <DashboardOverview_1.DashboardOverview />
      </div>
    </AdminLayout_1.AdminLayout>);
}
