import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Bookmark, Building2, UserCheck } from "lucide-react";

export function HorizontalMenuOpportunity() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex w-full flex-row justify-end gap-2 overflow-x-auto pr-1 pt-[0.4em]">
      {user?.role === "company" ? (
        <Button
          variant="outline"
          onClick={() => navigate("/opportunity/my-opportunities")}
          className="min-w-[14em] flex-shrink-0 justify-center bg-gradient-to-r from-third to-green-500 text-xs text-white shadow-md transition-all duration-300 hover:from-green-500 hover:to-emerald-500 hover:shadow-lg"
        >
          <Building2 className="h-4 w-4 text-white" />
          <span className="font-medium">Minhas oportunidades</span>
        </Button>
      ) : null}

      {user?.role === "athlete" ? (
        <>
          <Button
            onClick={() => navigate("/opportunity/my-opportunities")}
            className="min-w-[14em] flex-shrink-0 justify-center bg-green-700 text-xs text-white shadow-md transition-all duration-300 hover:bg-green-800 hover:shadow-lg"
          >
            <UserCheck className="h-4 w-4 text-white" />
            <span className="font-medium">Minhas candidaturas</span>
          </Button>

          <Button
            onClick={() => navigate("/opportunity/saved")}
            className="min-w-[14em] flex-shrink-0 justify-center bg-green-700 text-xs text-white shadow-md transition-all duration-300 hover:bg-green-800 hover:shadow-lg"
          >
            <Bookmark className="h-4 w-4 text-white" />
            <span className="font-medium">Oportunidades salvas</span>
          </Button>
        </>
      ) : null}
    </div>
  );
}
