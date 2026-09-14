import { create } from "zustand";

type OnboardingSurface = "notifications" | null;

type OnboardingStore = {
  activeSurface: OnboardingSurface;
  currentStepIndex: number;
  isFirstLoginModalOpen: boolean;
  isTourOpen: boolean;
  closeFirstLoginModal: () => void;
  closeTour: () => void;
  openFirstLoginModal: () => void;
  openTourAtStep: (stepIndex: number) => void;
  resetUi: () => void;
  setActiveSurface: (surface: OnboardingSurface) => void;
  startTour: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  activeSurface: null,
  currentStepIndex: 0,
  isFirstLoginModalOpen: false,
  isTourOpen: false,

  closeFirstLoginModal: () =>
    set({
      isFirstLoginModalOpen: false,
    }),

  closeTour: () =>
    set({
      activeSurface: null,
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
      activeSurface: null,
      currentStepIndex: 0,
      isFirstLoginModalOpen: false,
      isTourOpen: false,
    }),

  setActiveSurface: (surface: OnboardingSurface) =>
    set({
      activeSurface: surface,
    }),

  startTour: () =>
    set({
      activeSurface: null,
      currentStepIndex: 0,
      isFirstLoginModalOpen: false,
      isTourOpen: true,
    }),
}));
