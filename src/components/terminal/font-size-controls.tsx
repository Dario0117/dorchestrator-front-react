import { Button } from '@components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;
const FONT_SIZE_STEP = 2;
const DEFAULT_FONT_SIZE = 14;

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

interface FontSizeControlsProps {
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function FontSizeControls({
  fontSize,
  onIncrease,
  onDecrease,
}: FontSizeControlsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={onDecrease}
        disabled={fontSize <= MIN_FONT_SIZE}
        aria-label="Decrease font size"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-[3ch] text-center text-xs tabular-nums">
        {fontSize}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onIncrease}
        disabled={fontSize >= MAX_FONT_SIZE}
        aria-label="Increase font size"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
