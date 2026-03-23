import type { BgOption } from '@components/ds/utils/tokens';
import { BG } from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

interface BlurOverlayProps {
  bg?: BgOption;
}

function BlurOverlay({ bg = 'muted/30' }: BlurOverlayProps) {
  return (
    <div className={cn('absolute inset-0 -z-10 backdrop-blur-md', BG[bg])} />
  );
}

export { BlurOverlay };
export type { BlurOverlayProps };
