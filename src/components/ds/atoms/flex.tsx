import type { SpacingSize } from '@components/ds/atoms/box';
import { cn } from '@lib/utils';

type FlexDirection = 'row' | 'column';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexWrap = 'wrap' | 'nowrap' | 'reverse';
type GapSize = Exclude<SpacingSize, 'auto'>;

const DIRECTION: Record<FlexDirection, string> = {
  row: 'flex-row',
  column: 'flex-col',
};

const ALIGN: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const WRAP: Record<FlexWrap, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  reverse: 'flex-wrap-reverse',
};

const GAP: Record<GapSize, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

interface FlexProps extends Omit<React.ComponentProps<'div'>, 'className'> {
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: FlexWrap;
  gap?: GapSize;
  inline?: boolean;
}

function Flex({
  direction,
  align,
  justify,
  wrap,
  gap,
  inline,
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
      )}
      {...props}
    />
  );
}

export { Flex };
export type {
  FlexProps,
  FlexDirection,
  FlexAlign,
  FlexJustify,
  FlexWrap,
  GapSize,
};
