import { useRef, useState } from "react";
import { Stack } from "@/features/feed/lib/Stack";

const TYPING_PAUSE_MS = 600;

export function useTextHistory() {
  const history = useRef(new Stack<string>());
  const lastChangeAt = useRef<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  function record(previousText: string): void {
    const now = Date.now();
    const startsNewGroup =
      lastChangeAt.current === null ||
      now - lastChangeAt.current >= TYPING_PAUSE_MS;

    if (startsNewGroup) {
      history.current.push(previousText);
      setCanUndo(true);
    }

    lastChangeAt.current = now;
  }

  function undo(): string | undefined {
    const previousText = history.current.pop();

    lastChangeAt.current = null;
    setCanUndo(!history.current.isEmpty());

    return previousText;
  }

  function clear(): void {
    history.current.clear();
    lastChangeAt.current = null;
    setCanUndo(false);
  }

  return { record, undo, clear, canUndo };
}
