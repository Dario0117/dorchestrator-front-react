import { useCallback, useState } from 'react';

export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 14;
const FONT_SIZE_STEP = 2;

export function useFontSize(initial = DEFAULT_FONT_SIZE) {
  const [fontSize, setFontSize] = useState(initial);

  const increase = useCallback(() => {
    setFontSize((s) => Math.min(MAX_FONT_SIZE, s + FONT_SIZE_STEP));
  }, []);

  const decrease = useCallback(() => {
    setFontSize((s) => Math.max(MIN_FONT_SIZE, s - FONT_SIZE_STEP));
  }, []);

  return { fontSize, increase, decrease };
}
