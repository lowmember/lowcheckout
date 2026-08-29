import { useCallback, useEffect, useRef, useState } from "react";

export function useCopyToClipboard(resetDelay = 1800) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => () => clearTimeout(timeoutRef.current ?? undefined), []);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return false;
      }

      setCopiedValue(value);
      clearTimeout(timeoutRef.current ?? undefined);
      timeoutRef.current = setTimeout(() => setCopiedValue(null), resetDelay);
      return true;
    },
    [resetDelay],
  );

  return { copy, copiedValue };
}
