import { useCallback, useRef, useState } from 'react';

const RESET_DELAY_MS = 2000;

/**
 * Hook for copying text to clipboard with visual feedback.
 *
 * Supports an optional `key` parameter to distinguish multiple copy buttons
 * in the same component (e.g. `copy(text, 'resourceId')`).
 *
 * - `hasCopied`: true when any copy succeeded (resets after 2s)
 * - `copiedKey`: the key of the last copied item (resets after 2s)
 * - `copy(text, key?)`: copies text and sets feedback state
 */
export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string, key?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCopiedKey(key ?? text);
      timeoutRef.current = setTimeout(() => {
        setCopiedKey(null);
        timeoutRef.current = null;
      }, RESET_DELAY_MS);
    } catch {
      // Clipboard API unavailable (non-HTTPS or permission denied)
    }
  }, []);

  return { copiedKey, copy, hasCopied: copiedKey !== null };
}
