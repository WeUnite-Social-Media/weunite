import { Sparkles } from "lucide-react";
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
  onSkipTour: () => void;
  onStartTour: () => void;
};

export function FirstLoginModal({
  open,
  onSkipTour,
  onStartTour,
}: FirstLoginModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl">Bem-vindo ao WeUnite</DialogTitle>
          <DialogDescription className="max-w-sm">
            Quer uma apresentação rápida da plataforma antes de começar? Ela
            passa pelos pontos principais e leva menos de um minuto.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" className="w-full" onClick={onStartTour}>
            Quero conhecer a plataforma
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onSkipTour}
          >
            Já conheço, seguir sem tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
