import type {
  BgOption,
  BorderOption,
  FixedSpacingSize,
  RoundedOption,
  SpacingSize,
} from '@components/ds/utils/tokens';
import {
  BG,
  BORDER,
  INNER_Y,
  ROUNDED,
  SPACE_ABOVE,
  SPACE_X,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

type PaddingSize = 'none' | 'sm' | 'md' | 'lg';
type CenterSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const PADDING: Record<PaddingSize, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10',
};

const SIZE: Record<CenterSize, string> = {
  xs: 'h-2 w-2',
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-24 w-24',
  '2xl': 'h-32 w-32',
};

interface CenterProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  fullHeight?: boolean;
  fullWidth?: boolean;
  fullScreen?: boolean;
  padding?: PaddingSize;
  size?: CenterSize;
  shrink?: boolean;
  grow?: boolean;
  minW0?: boolean;
  border?: BorderOption;
  rounded?: RoundedOption;
  bg?: BgOption;
  spaceX?: SpacingSize;
  spaceAbove?: SpacingSize;
  textSize?: 'xs' | 'sm' | 'base' | '4xl';
  innerSpaceY?: FixedSpacingSize;
}

function Center({
  fullHeight,
  fullWidth,
  fullScreen,
  padding,
  size,
  shrink,
  grow,
  minW0,
  border,
  rounded,
  bg,
  spaceX,
  spaceAbove,
  textSize,
  innerSpaceY,
  ...props
}: CenterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullHeight && 'h-full',
        fullWidth && 'w-full',
        fullScreen && 'min-h-svh w-full',
        padding && PADDING[padding],
        size && SIZE[size],
        shrink === false && 'shrink-0',
        grow && 'flex-1',
        minW0 && 'min-w-0',
        border && BORDER[border],
        rounded && ROUNDED[rounded],
        bg && BG[bg],
        spaceX && SPACE_X[spaceX],
        spaceAbove && SPACE_ABOVE[spaceAbove],
        textSize === 'xs' && 'text-xs',
        textSize === 'sm' && 'text-sm',
        textSize === 'base' && 'text-base',
        textSize === '4xl' && 'text-4xl font-bold',
        innerSpaceY && INNER_Y[innerSpaceY],
      )}
      {...props}
    />
  );
}

export { Center };
export type { CenterProps };
