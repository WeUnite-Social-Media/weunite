import { useCallback, useEffect, useState } from "react";

const getFirstLoginStorageKey = (userId?: string) => {
  return userId ? `weunite.onboarding.seen.${userId}` : null;
};

export function useFirstLogin(userId?: string) {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const storageKey = getFirstLoginStorageKey(userId);

    if (!userId || !storageKey || typeof window === "undefined") {
      setHasSeenOnboarding(true);
      setIsReady(true);
      return;
    }

    const seen = window.localStorage.getItem(storageKey) === "true";
    setHasSeenOnboarding(seen);
    setIsReady(true);
  }, [userId]);

  const markOnboardingSeen = useCallback(() => {
    const storageKey = getFirstLoginStorageKey(userId);

    if (!storageKey || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, "true");
    setHasSeenOnboarding(true);
  }, [userId]);

  const resetOnboardingSeen = useCallback(() => {
    const storageKey = getFirstLoginStorageKey(userId);

    if (!storageKey || typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    setHasSeenOnboarding(false);
  }, [userId]);

  return {
    isReady,
    hasSeenOnboarding,
    markOnboardingSeen,
    resetOnboardingSeen,
  };
}
