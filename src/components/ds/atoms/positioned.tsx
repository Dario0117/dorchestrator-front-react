import type {
  FixedSpacingSize,
  MaxWidth,
  SpacingSize,
} from '@components/ds/utils/tokens';
import {
  INNER_BOTTOM,
  INNER_LEFT,
  INNER_RIGHT,
  INNER_TOP,
  INNER_X,
  INNER_Y,
  MAX_WIDTH,
  SPACE_ABOVE,
  SPACE_BELOW,
  SPACE_LEFT,
  SPACE_RIGHT,
  SPACE_X,
  SPACE_Y,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

type Position = 'relative' | 'absolute';

const POSITION: Record<Position, string> = {
  relative: 'relative',
  absolute: 'absolute',
};

const INSET_RIGHT: Record<FixedSpacingSize, string> = {
  xs: 'right-1',
  sm: 'right-2',
  md: 'right-4',
  lg: 'right-6',
  xl: 'right-8',
};

interface PositionedProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  position?: Position;
  inset0?: boolean;
  insetTopRight?: boolean;
  insetYCenter?: boolean;
  insetRight?: FixedSpacingSize;
  zIndex?: 'behind';
  showOnGroupHover?: boolean;
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

function Positioned({
  position,
  inset0,
  insetTopRight,
  insetYCenter,
  insetRight,
  zIndex,
  showOnGroupHover,
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
}: PositionedProps) {
  return (
    <div
      className={cn(
        position && POSITION[position],
        inset0 && 'inset-0',
        insetTopRight && '-right-1 -top-1',
        insetYCenter && 'top-1/2 -translate-y-1/2',
        insetRight && INSET_RIGHT[insetRight],
        zIndex === 'behind' && '-z-10',
        showOnGroupHover && 'opacity-0 group-hover:opacity-100',
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

export { Positioned };
export type { PositionedProps };
