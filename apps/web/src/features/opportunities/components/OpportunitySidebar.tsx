import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Bookmark, Building2, Plus, UserCheck } from "lucide-react";
import { CreateOpportunity } from "@/features/opportunities/components/CreateOpportunity";

export function OpportunitySidebar() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-auto z-30 hidden space-y-4 lg:fixed lg:right-8 lg:top-32 lg:flex lg:w-64 lg:flex-col">
        {user?.role === "company" ? (
          <>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="h-12 w-full justify-center gap-2 bg-gradient-to-r from-third to-green-500 text-white shadow-md transition-all duration-300 hover:from-green-500 hover:to-emerald-500 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Criar oportunidade
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/opportunity/my-opportunities")}
              className="group relative h-12 w-full justify-start gap-3 overflow-hidden border-border bg-gradient-to-r from-card to-card/90 transition-all duration-300 hover:border-green-300 hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:shadow-green-500/10 dark:hover:from-green-950/20 dark:hover:to-green-900/30"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 transition-colors duration-300 group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-800/40">
                  <Building2 className="h-4 w-4 text-green-600 transition-transform duration-300 group-hover:scale-110 dark:text-green-400" />
                </div>
                <span className="font-medium text-foreground transition-colors duration-300 group-hover:text-green-700 dark:group-hover:text-green-300">
                  Minhas oportunidades
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute -right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-green-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </Button>
          </>
        ) : null}

        {user?.role === "athlete" ? (
          <>
            <Button
              variant="outline"
              onClick={() => navigate("/opportunity/my-opportunities")}
              className="group relative h-12 w-full justify-start gap-3 overflow-hidden border-border bg-gradient-to-r from-card to-card/90 transition-all duration-300 hover:border-green-300 hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:shadow-green-500/10 dark:hover:from-green-950/20 dark:hover:to-green-900/30"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 transition-colors duration-300 group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-800/40">
                  <UserCheck className="h-4 w-4 text-green-600 transition-transform duration-300 group-hover:scale-110 dark:text-green-400" />
                </div>
                <span className="font-medium text-foreground transition-colors duration-300 group-hover:text-green-700 dark:group-hover:text-green-300">
                  Minhas candidaturas
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute -right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-green-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/opportunity/saved")}
              className="group relative h-12 w-full justify-start gap-3 overflow-hidden border-border bg-gradient-to-r from-card to-card/90 transition-all duration-300 hover:border-green-300 hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:shadow-green-500/10 dark:hover:from-green-950/20 dark:hover:to-green-900/30"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 transition-colors duration-300 group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-800/40">
                  <Bookmark className="h-4 w-4 text-green-600 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110 dark:text-green-400" />
                </div>
                <span className="font-medium text-foreground transition-colors duration-300 group-hover:text-green-700 dark:group-hover:text-green-300">
                  Oportunidades salvas
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute -right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-green-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </Button>
          </>
        ) : null}
      </div>

      {user?.role === "company" ? (
        <CreateOpportunity open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      ) : null}
    </>
  );
}
