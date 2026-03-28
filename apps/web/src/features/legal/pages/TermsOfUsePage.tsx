import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TermsOfUseArticle } from "@/features/legal/components/TermsOfUseArticle";
import { TERMS_OF_USE_LAST_UPDATED } from "@/features/legal/constants/termsOfUse";
import { Button } from "@/shared/components/ui/button";

export function TermsOfUsePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última atualização: {TERMS_OF_USE_LAST_UPDATED}
          </p>

          <div className="mt-8 max-h-[70vh] overflow-y-auto pr-2">
            <TermsOfUseArticle />
          </div>
        </div>
      </div>
    </div>
  );
}
