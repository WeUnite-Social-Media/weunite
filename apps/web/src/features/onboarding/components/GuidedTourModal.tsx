import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { OnboardingStep } from "@/features/onboarding/constants/tourSteps";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Progress } from "@/shared/components/ui/progress";

type GuidedTourModalProps = {
  currentStepIndex: number;
  open: boolean;
  step: OnboardingStep;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  onSkip: () => void;
};

export function GuidedTourModal({
  currentStepIndex,
  open,
  step,
  totalSteps,
  onPrevious,
  onNext,
  onFinish,
  onSkip,
}: GuidedTourModalProps) {
  const StepIcon = step.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <StepIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Passo {currentStepIndex + 1} de {totalSteps}
                </p>
                <DialogTitle className="mt-1 text-2xl">{step.title}</DialogTitle>
              </div>
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
              Pular
            </Button>
          </div>

          <Progress value={progress} />

          <DialogDescription className="pt-2 text-base leading-relaxed text-foreground">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          {step.helperText}
        </div>

        <DialogFooter className="items-center justify-between gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {isLastStep ? (
            <Button type="button" onClick={onFinish}>
              <CheckCircle2 className="h-4 w-4" />
              Concluir tour
            </Button>
          ) : (
            <Button type="button" onClick={onNext}>
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
