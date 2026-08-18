import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { FirstLoginModal } from "@/features/onboarding/components/FirstLoginModal";
import { GuidedTourModal } from "@/features/onboarding/components/GuidedTourModal";
import { getOnboardingSteps } from "@/features/onboarding/constants/tourSteps";
import { useFirstLogin } from "@/features/onboarding/hooks/useFirstLogin";
import { useOnboardingStore } from "@/features/onboarding/state/useOnboardingStore";

export function OnboardingController() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { hasSeenOnboarding, isReady, markOnboardingSeen } = useFirstLogin(
    user?.id,
  );
  const currentStepIndex = useOnboardingStore(
    (state) => state.currentStepIndex,
  );
  const isFirstLoginModalOpen = useOnboardingStore(
    (state) => state.isFirstLoginModalOpen,
  );
  const isTourOpen = useOnboardingStore((state) => state.isTourOpen);
  const closeFirstLoginModal = useOnboardingStore(
    (state) => state.closeFirstLoginModal,
  );
  const closeTourUi = useOnboardingStore((state) => state.closeTour);
  const openFirstLoginModal = useOnboardingStore(
    (state) => state.openFirstLoginModal,
  );
  const openTourAtStep = useOnboardingStore((state) => state.openTourAtStep);
  const resetUi = useOnboardingStore((state) => state.resetUi);
  const setActiveSurface = useOnboardingStore(
    (state) => state.setActiveSurface,
  );
  const startTour = useOnboardingStore((state) => state.startTour);

  const steps = useMemo(() => {
    return getOnboardingSteps(user?.role);
  }, [user?.role]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isReady) {
      resetUi();
      return;
    }

    if (!hasSeenOnboarding && !isFirstLoginModalOpen && !isTourOpen) {
      openFirstLoginModal();
    }
  }, [
    hasSeenOnboarding,
    isAuthenticated,
    isFirstLoginModalOpen,
    isReady,
    isTourOpen,
    openFirstLoginModal,
    resetUi,
    user?.id,
  ]);

  useEffect(() => {
    if (!isTourOpen) {
      return;
    }

    const step = steps[currentStepIndex];

    if (!step) {
      closeTourUi();
      navigate("/home");
      return;
    }

    navigate(step.route);
    setActiveSurface(step.id === "notifications" ? "notifications" : null);
  }, [
    closeTourUi,
    currentStepIndex,
    isTourOpen,
    navigate,
    setActiveSurface,
    steps,
  ]);

  const closeTour = useCallback(() => {
    closeFirstLoginModal();
    closeTourUi();
    navigate("/home");
  }, [closeFirstLoginModal, closeTourUi, navigate]);

  const handleSkipTour = useCallback(() => {
    markOnboardingSeen();
    closeTour();
  }, [closeTour, markOnboardingSeen]);

  const handleStartTour = useCallback(() => {
    startTour();
  }, [startTour]);

  const handleFinishTour = useCallback(() => {
    markOnboardingSeen();
    closeTour();
  }, [closeTour, markOnboardingSeen]);

  const handleNextStep = useCallback(() => {
    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex >= steps.length) {
      handleFinishTour();
      return;
    }

    openTourAtStep(nextStepIndex);
  }, [currentStepIndex, handleFinishTour, openTourAtStep, steps.length]);

  const handlePreviousStep = useCallback(() => {
    const previousStepIndex = currentStepIndex - 1;

    if (previousStepIndex < 0) {
      return;
    }

    openTourAtStep(previousStepIndex);
  }, [currentStepIndex, openTourAtStep]);

  if (!isAuthenticated || !user?.id || !isReady) {
    return null;
  }

  return (
    <>
      <FirstLoginModal
        open={isFirstLoginModalOpen}
        userRole={user?.role}
        onSkipTour={handleSkipTour}
        onStartTour={handleStartTour}
      />

      <GuidedTourModal
        currentStepIndex={currentStepIndex}
        open={isTourOpen}
        step={steps[currentStepIndex]}
        totalSteps={steps.length}
        onPrevious={handlePreviousStep}
        onNext={handleNextStep}
        onFinish={handleFinishTour}
        onSkip={handleSkipTour}
      />
    </>
  );
}
