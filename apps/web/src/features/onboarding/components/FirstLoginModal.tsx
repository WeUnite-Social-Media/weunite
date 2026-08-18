import { Compass, Sparkles, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

type FirstLoginModalProps = {
  open: boolean;
  userRole?: string;
  onSkipTour: () => void;
  onStartTour: () => void;
};

export function FirstLoginModal({
  open,
  userRole,
  onSkipTour,
  onStartTour,
}: FirstLoginModalProps) {
  const isCompany =
    userRole?.toUpperCase().includes("COMPANY") ||
    userRole?.toUpperCase().includes("EMPRESA") ||
    userRole?.toUpperCase().includes("SPONSOR");

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-md shadow-xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center text-center sm:text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5 transition-transform hover:scale-105">
            {isCompany ? (
              <Sparkles className="h-7 w-7 text-emerald-500 animate-pulse" />
            ) : (
              <Trophy className="h-7 w-7 text-emerald-500 animate-pulse" />
            )}
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              Bem-vindo ao WeUnite!
            </DialogTitle>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isCompany
                ? "Perfil de Empresa / Patrocinador"
                : "Perfil de Atleta / Esportista"}
            </p>
          </div>

          <DialogDescription className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {isCompany
              ? "Preparamos um tour rápido para você aprender a publicar oportunidades, encontrar atletas e gerenciar sua presença esportiva."
              : "Quer conhecer os recursos principais para impulsionar sua carreira esportiva, buscar patrocínios e conectar-se com marcas?"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2.5 pt-4 sm:flex-col">
          <Button
            type="button"
            className="w-full h-11 text-sm font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-all"
            onClick={onStartTour}
          >
            <Compass className="h-4 w-4" />
            Iniciar Tour Guiado (1 min)
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={onSkipTour}
          >
            Já conheço a plataforma, ir direto para a home
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
