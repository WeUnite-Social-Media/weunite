import { create } from "zustand";

type OnboardingStore = {
  currentStepIndex: number;
  isFirstLoginModalOpen: boolean;
  isTourOpen: boolean;
  closeFirstLoginModal: () => void;
  closeTour: () => void;
  openFirstLoginModal: () => void;
  openTourAtStep: (stepIndex: number) => void;
  resetUi: () => void;
  startTour: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  currentStepIndex: 0,
  isFirstLoginModalOpen: false,
  isTourOpen: false,

  closeFirstLoginModal: () =>
    set({
      isFirstLoginModalOpen: false,
    }),

  closeTour: () =>
    set({
      currentStepIndex: 0,
      isTourOpen: false,
    }),

  openFirstLoginModal: () =>
    set({
      isFirstLoginModalOpen: true,
    }),

  openTourAtStep: (stepIndex: number) =>
    set({
      currentStepIndex: stepIndex,
      isFirstLoginModalOpen: false,
      isTourOpen: true,
    }),

  resetUi: () =>
    set({
      currentStepIndex: 0,
      isFirstLoginModalOpen: false,
      isTourOpen: false,
    }),

  startTour: () =>
    set({
      currentStepIndex: 0,
      isFirstLoginModalOpen: false,
      isTourOpen: true,
    }),
}));
