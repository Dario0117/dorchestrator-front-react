import type {
  BgOption,
  BorderOption,
  FixedSpacingSize,
  GapSize,
  MaxWidth,
  RoundedOption,
} from '@components/ds/utils/tokens';
import {
  BG,
  BORDER,
  GAP,
  INNER_Y,
  MAX_WIDTH,
  ROUNDED,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

type ColCount = 1 | 2 | 3 | 4;
type FixedColCount = 3 | 4 | 6 | 9;

const RESPONSIVE_COLS: Record<ColCount, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

const FIXED_COLS: Record<FixedColCount, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  9: 'grid-cols-9',
};

interface GridProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  cols?: ColCount;
  fixedCols?: FixedColCount;
  gap?: GapSize;
  shrink?: boolean;
  fullHeight?: boolean;
  fullWidth?: boolean;
  grow?: boolean;
  minW0?: boolean;
  border?: BorderOption;
  rounded?: RoundedOption;
  bg?: BgOption;
  maxWidth?: MaxWidth;
  innerSpaceY?: FixedSpacingSize;
}

function Grid({
  cols = 1,
  fixedCols,
  gap,
  shrink,
  fullHeight,
  fullWidth,
  grow,
  minW0,
  border,
  rounded,
  bg,
  maxWidth,
  innerSpaceY,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        fixedCols ? FIXED_COLS[fixedCols] : RESPONSIVE_COLS[cols],
        gap && GAP[gap],
        shrink === false && 'shrink-0',
        fullHeight && 'h-full',
        fullWidth && 'w-full',
        grow && 'flex-1',
        minW0 && 'min-w-0',
        border && BORDER[border],
        rounded && ROUNDED[rounded],
        bg && BG[bg],
        maxWidth && MAX_WIDTH[maxWidth],
        innerSpaceY && INNER_Y[innerSpaceY],
      )}
      {...props}
    />
  );
}

export { Grid };
export type { GridProps };
