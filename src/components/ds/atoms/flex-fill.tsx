import type { BoxProps } from '@components/ds/atoms/box';
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

type FlexFillProps = Omit<BoxProps, 'grow' | 'minW0'>;

function FlexFill({
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
  shrink,
  ...props
}: FlexFillProps) {
  return (
    <div
      className={cn(
        'relative min-h-0 min-w-0 flex-1',
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
        shrink === false && 'shrink-0',
      )}
      {...props}
    />
  );
}

export { FlexFill };
export type { FlexFillProps };
