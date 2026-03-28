import { useCallback, useEffect, useState } from "react";

const getFirstLoginStorageKey = (userId?: string) => {
  return userId ? `weunite.onboarding.seen.${userId}` : null;
};

export function useFirstLogin(userId?: string) {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const storageKey = getFirstLoginStorageKey(userId);

    if (!storageKey || typeof window === "undefined") {
      setHasSeenOnboarding(true);
      setIsReady(true);
      return;
    }

    setHasSeenOnboarding(window.localStorage.getItem(storageKey) === "true");
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

  return {
    isReady,
    hasSeenOnboarding,
    markOnboardingSeen,
  };
}
