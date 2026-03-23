import { Button } from '@components/ds/atoms/button';
import { HStack } from '@components/ds/atoms/hstack';
import { SmallText } from '@components/ds/atoms/small-text';
import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '@domains/terminal/hooks/use-font-size';
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
    <HStack gap="none">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDecrease}
        disabled={fontSize <= MIN_FONT_SIZE}
        aria-label="Decrease font size"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <SmallText
        color="muted"
        centered
        tabularNums
        minWidth="3ch"
      >
        {fontSize}
      </SmallText>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onIncrease}
        disabled={fontSize >= MAX_FONT_SIZE}
        aria-label="Increase font size"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </HStack>
  );
}
