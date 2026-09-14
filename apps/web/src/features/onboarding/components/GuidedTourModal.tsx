import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
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
  step?: OnboardingStep;
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
  if (!step) {
    return null;
  }

  const StepIcon = step.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg border-primary/20 bg-background/95 backdrop-blur-md shadow-2xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/5">
                <StepIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Passo {currentStepIndex + 1} de {totalSteps}
                  </span>
                  {step.categoryTag && (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {step.categoryTag}
                    </span>
                  )}
                </div>
                <DialogTitle className="mt-1 text-2xl font-bold tracking-tight">
                  {step.title}
                </DialogTitle>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={onSkip}
            >
              Pular tour
            </Button>
          </div>

          <Progress value={progress} className="h-1.5 bg-muted" />

          <DialogDescription className="pt-2 text-base leading-relaxed text-foreground font-normal">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground flex gap-3 items-start">
          <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>{step.helperText}</div>
        </div>

        <DialogFooter className="items-center justify-between gap-3 pt-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
              onClick={onFinish}
            >
              <CheckCircle2 className="h-4 w-4" />
              Concluir Apresentação
            </Button>
          ) : (
            <Button
              type="button"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
              onClick={onNext}
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
