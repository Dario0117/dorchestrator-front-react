import type {
  AlignOption,
  BgOption,
  BorderOption,
  FixedSpacingSize,
  GapSize,
  JustifyOption,
  RoundedOption,
  SpacingSize,
  TextAlign,
  TextSize,
} from '@components/ds/utils/tokens';
import {
  ALIGN,
  BG,
  BORDER,
  GAP,
  INNER_BOTTOM,
  INNER_X,
  INNER_Y,
  JUSTIFY,
  ROUNDED,
  SPACE_LEFT,
  TEXT_ALIGN,
  TEXT_SIZE,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

interface HStackProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  gap?: GapSize;
  align?: AlignOption;
  justify?: JustifyOption;
  wrap?: boolean;
  inline?: boolean;
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
  overflowX?: 'auto' | 'hidden' | 'scroll';
  spaceLeft?: SpacingSize;
  spaceInlineStart?: 'auto';
  innerSpaceBelow?: FixedSpacingSize;
}

function HStack({
  gap,
  align = 'center',
  justify,
  wrap,
  inline,
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
  overflowX,
  spaceLeft,
  spaceInlineStart,
  innerSpaceBelow,
  ...props
}: HStackProps) {
  return (
    <div
      className={cn(
        inline ? 'inline-flex' : 'flex',
        gap && GAP[gap],
        ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && 'flex-wrap',
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
        overflowX === 'auto' && 'overflow-x-auto',
        overflowX === 'hidden' && 'overflow-x-hidden',
        overflowX === 'scroll' && 'overflow-x-scroll',
        spaceLeft && SPACE_LEFT[spaceLeft],
        spaceInlineStart === 'auto' && 'ms-auto',
        innerSpaceBelow && INNER_BOTTOM[innerSpaceBelow],
      )}
      {...props}
    />
  );
}

export { HStack };
