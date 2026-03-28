import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { FirstLoginModal } from "@/features/onboarding/components/FirstLoginModal";
import { GuidedTourModal } from "@/features/onboarding/components/GuidedTourModal";
import { ONBOARDING_STEPS } from "@/features/onboarding/constants/tourSteps";
import { useFirstLogin } from "@/features/onboarding/hooks/useFirstLogin";

export function OnboardingController() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { hasSeenOnboarding, isReady, markOnboardingSeen } = useFirstLogin(
    user?.id,
  );

  const [isFirstLoginModalOpen, setIsFirstLoginModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isReady) {
      setIsFirstLoginModalOpen(false);
      setIsTourOpen(false);
      setCurrentStepIndex(0);
      return;
    }

    if (!hasSeenOnboarding) {
      setIsFirstLoginModalOpen(true);
    }
  }, [hasSeenOnboarding, isAuthenticated, isReady, user?.id]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      const step = ONBOARDING_STEPS[stepIndex];

      if (!step) {
        return;
      }

      setCurrentStepIndex(stepIndex);
      navigate(step.route);
    },
    [navigate],
  );

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setCurrentStepIndex(0);
    navigate("/home");
  }, [navigate]);

  const handleSkipTour = useCallback(() => {
    markOnboardingSeen();
    setIsFirstLoginModalOpen(false);
    closeTour();
  }, [closeTour, markOnboardingSeen]);

  const handleStartTour = useCallback(() => {
    markOnboardingSeen();
    setIsFirstLoginModalOpen(false);
    setIsTourOpen(true);
    goToStep(0);
  }, [goToStep, markOnboardingSeen]);

  const handleNextStep = useCallback(() => {
    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex >= ONBOARDING_STEPS.length) {
      closeTour();
      return;
    }

    goToStep(nextStepIndex);
  }, [closeTour, currentStepIndex, goToStep]);

  const handlePreviousStep = useCallback(() => {
    const previousStepIndex = currentStepIndex - 1;

    if (previousStepIndex < 0) {
      return;
    }

    goToStep(previousStepIndex);
  }, [currentStepIndex, goToStep]);

  if (!isAuthenticated || !user?.id || !isReady) {
    return null;
  }

  return (
    <>
      <FirstLoginModal
        open={isFirstLoginModalOpen}
        onSkipTour={handleSkipTour}
        onStartTour={handleStartTour}
      />

      <GuidedTourModal
        currentStepIndex={currentStepIndex}
        open={isTourOpen}
        step={ONBOARDING_STEPS[currentStepIndex]}
        totalSteps={ONBOARDING_STEPS.length}
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        onFinish={closeTour}
        onSkip={handleSkipTour}
      />
    </>
  );
}
