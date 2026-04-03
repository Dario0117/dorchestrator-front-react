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

type Overflow = 'auto' | 'hidden' | 'scroll';

const OVERFLOW: Record<Overflow, string> = {
  auto: 'overflow-auto',
  hidden: 'overflow-hidden',
  scroll: 'overflow-scroll',
};

const OVERFLOW_Y: Record<Overflow, string> = {
  auto: 'overflow-y-auto',
  hidden: 'overflow-y-hidden',
  scroll: 'overflow-y-scroll',
};

interface ScrollableProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  overflow?: Overflow;
  overflowY?: Overflow;
  maxH?: 'xs' | 'sm' | 'md' | 'lg';
  minH?: 'sm' | 'md' | 'lg';
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

function Scrollable({
  overflow,
  overflowY,
  maxH,
  minH,
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
}: ScrollableProps) {
  return (
    <div
      className={cn(
        overflow && OVERFLOW[overflow],
        overflowY && OVERFLOW_Y[overflowY],
        maxH === 'xs' && 'max-h-32',
        maxH === 'sm' && 'max-h-48',
        maxH === 'md' && 'max-h-64',
        maxH === 'lg' && 'max-h-80',
        minH === 'sm' && 'min-h-48',
        minH === 'md' && 'min-h-[300px]',
        minH === 'lg' && 'min-h-96',
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

export { Scrollable };
