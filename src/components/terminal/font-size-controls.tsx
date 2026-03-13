import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '@components/terminal/hooks/use-font-size';
import { Button } from '@components/ui/button';
import { Minus, Plus } from 'lucide-react';

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
