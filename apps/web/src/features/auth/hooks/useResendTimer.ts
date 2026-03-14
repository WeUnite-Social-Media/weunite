import { useCallback, useEffect, useState } from "react";

export function useResendTimer(initialTimerValue?: number) {
  const initialTimer = initialTimerValue ?? 60;
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const startTimer = useCallback(() => {
    setCanResend(false);
    setTimer(initialTimer);
  }, [initialTimer]);

  useEffect(() => {
    let interval: number | undefined;
    if (timer > 0 && !canResend) {
      interval = window.setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  return { timer, canResend, startTimer };
}
