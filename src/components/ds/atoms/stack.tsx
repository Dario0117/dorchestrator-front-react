import type {
  AlignOption,
  BgOption,
  BorderOption,
  FixedSpacingSize,
  GapSize,
  RoundedOption,
  TextAlign,
  TextSize,
} from '@components/ds/utils/tokens';
import {
  ALIGN,
  BG,
  BORDER,
  GAP,
  INNER_X,
  INNER_Y,
  ROUNDED,
  TEXT_ALIGN,
  TEXT_SIZE,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

interface StackProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  gap?: GapSize;
  align?: AlignOption;
  shrink?: boolean;
  fullHeight?: boolean;
  fullWidth?: boolean;
  grow?: boolean;
  minW0?: boolean;
  border?: BorderOption;
  rounded?: RoundedOption;
  bg?: BgOption;
  innerSpaceX?: FixedSpacingSize;
  innerSpaceY?: FixedSpacingSize;
  textAlign?: TextAlign;
  textSize?: TextSize;
  safeAreaBottom?: boolean;
  overflowY?: 'auto' | 'hidden' | 'scroll';
  maxH?: 'xs' | 'sm' | 'md' | 'lg';
  leading?: 'tight' | 'snug' | 'normal';
}

function Stack({
  gap = 'md',
  align,
  shrink,
  fullHeight,
  fullWidth,
  grow,
  minW0,
  border,
  rounded,
  bg,
  innerSpaceX,
  innerSpaceY,
  textAlign,
  textSize,
  safeAreaBottom,
  overflowY,
  maxH,
  leading,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        GAP[gap],
        align && ALIGN[align],
        shrink === false && 'shrink-0',
        fullHeight && 'h-full',
        fullWidth && 'w-full',
        grow && 'flex-1',
        minW0 && 'min-w-0',
        border && BORDER[border],
        rounded && ROUNDED[rounded],
        bg && BG[bg],
        innerSpaceX && INNER_X[innerSpaceX],
        innerSpaceY && INNER_Y[innerSpaceY],
        textAlign && TEXT_ALIGN[textAlign],
        textSize && TEXT_SIZE[textSize],
        safeAreaBottom && 'pb-[env(safe-area-inset-bottom)]',
        overflowY === 'auto' && 'overflow-y-auto',
        overflowY === 'hidden' && 'overflow-y-hidden',
        overflowY === 'scroll' && 'overflow-y-scroll',
        maxH === 'xs' && 'max-h-32',
        maxH === 'sm' && 'max-h-48',
        maxH === 'md' && 'max-h-64',
        maxH === 'lg' && 'max-h-80',
        leading === 'tight' && 'leading-tight',
        leading === 'snug' && 'leading-snug',
        leading === 'normal' && 'leading-normal',
      )}
      {...props}
    />
  );
}

export { Stack };
