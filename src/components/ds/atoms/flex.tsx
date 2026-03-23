import type {
  AlignOption,
  BgOption,
  BorderOption,
  GapSize,
  JustifyOption,
  RoundedOption,
} from '@components/ds/utils/tokens';
import {
  ALIGN,
  BG,
  BORDER,
  GAP,
  JUSTIFY,
  ROUNDED,
} from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

type FlexDirection = 'row' | 'column' | 'column-reverse';
type FlexWrap = 'wrap' | 'nowrap' | 'reverse';

const DIRECTION: Record<FlexDirection, string> = {
  row: 'flex-row',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const WRAP: Record<FlexWrap, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  reverse: 'flex-wrap-reverse',
};

interface FlexProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  direction?: FlexDirection;
  align?: AlignOption;
  justify?: JustifyOption;
  wrap?: FlexWrap;
  gap?: GapSize;
  inline?: boolean;
  shrink?: boolean;
  fullHeight?: boolean;
  grow?: boolean;
  minW0?: boolean;
  border?: BorderOption;
  rounded?: RoundedOption;
  bg?: BgOption;
}

function Flex({
  direction,
  align,
  justify,
  wrap,
  gap,
  inline,
  shrink,
  fullHeight,
  grow,
  minW0,
  border,
  rounded,
  bg,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        inline ? 'inline-flex' : 'flex',
        direction && DIRECTION[direction],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && WRAP[wrap],
        gap && GAP[gap],
        shrink === false && 'shrink-0',
        fullHeight && 'h-full',
        grow && 'flex-1',
        minW0 && 'min-w-0',
        border && BORDER[border],
        rounded && ROUNDED[rounded],
        bg && BG[bg],
      )}
      {...props}
    />
  );
}

export { Flex };
export type { FlexProps, FlexDirection, FlexWrap };
