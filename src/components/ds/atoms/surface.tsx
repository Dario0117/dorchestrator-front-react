import type {
  BgOption,
  BorderOption,
  FixedSpacingSize,
  MaxWidth,
  RoundedOption,
  SpacingSize,
} from '@components/ds/utils/tokens';
import {
  BG,
  BORDER,
  INNER_BOTTOM,
  INNER_LEFT,
  INNER_RIGHT,
  INNER_TOP,
  INNER_X,
  INNER_Y,
  MAX_WIDTH,
  ROUNDED,
  SPACE_ABOVE,
  SPACE_BELOW,
  SPACE_LEFT,
  SPACE_RIGHT,
  SPACE_X,
  SPACE_Y,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

interface SurfaceProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  bg?: BgOption;
  border?: BorderOption;
  rounded?: RoundedOption;
  spaceAbove?: SpacingSize;
  spaceBelow?: SpacingSize;
  spaceLeft?: SpacingSize;
  spaceRight?: SpacingSize;
  spaceX?: SpacingSize;
  spaceY?: SpacingSize;
  innerSpaceAbove?: FixedSpacingSize;
  innerSpaceBelow?: FixedSpacingSize;
  innerSpaceLeft?: FixedSpacingSize;
  innerSpaceRight?: FixedSpacingSize;
  innerSpaceX?: FixedSpacingSize;
  innerSpaceY?: FixedSpacingSize;
  fullWidth?: boolean;
  fullHeight?: boolean;
  maxWidth?: MaxWidth;
  grow?: boolean;
  shrink?: boolean;
  minW0?: boolean;
}

function Surface({
  bg,
  border,
  rounded,
  spaceAbove,
  spaceBelow,
  spaceLeft,
  spaceRight,
  spaceX,
  spaceY,
  innerSpaceAbove,
  innerSpaceBelow,
  innerSpaceLeft,
  innerSpaceRight,
  innerSpaceX,
  innerSpaceY,
  fullWidth,
  fullHeight,
  maxWidth,
  grow,
  shrink,
  minW0,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        bg && BG[bg],
        border && BORDER[border],
        rounded && ROUNDED[rounded],
        spaceAbove && SPACE_ABOVE[spaceAbove],
        spaceBelow && SPACE_BELOW[spaceBelow],
        spaceLeft && SPACE_LEFT[spaceLeft],
        spaceRight && SPACE_RIGHT[spaceRight],
        spaceX && SPACE_X[spaceX],
        spaceY && SPACE_Y[spaceY],
        innerSpaceAbove && INNER_TOP[innerSpaceAbove],
        innerSpaceBelow && INNER_BOTTOM[innerSpaceBelow],
        innerSpaceLeft && INNER_LEFT[innerSpaceLeft],
        innerSpaceRight && INNER_RIGHT[innerSpaceRight],
        innerSpaceX && INNER_X[innerSpaceX],
        innerSpaceY && INNER_Y[innerSpaceY],
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        maxWidth && MAX_WIDTH[maxWidth],
        grow && 'flex-1',
        shrink === false && 'shrink-0',
        minW0 && 'min-w-0',
      )}
      {...props}
    />
  );
}

export { Surface };
export type { SurfaceProps };
