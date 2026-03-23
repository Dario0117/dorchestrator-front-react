import type {
  FontWeight,
  SpacingSize,
  TextColor,
  TextSize,
} from '@components/ds/utils/tokens';
import {
  FONT_WEIGHT,
  SPACE_ABOVE,
  SPACE_LEFT,
  TEXT_COLOR,
  TEXT_SIZE,
} from '@components/ds/utils/tokens';
import { cn } from '@/lib/utils';

type SmallTextMaxWidth = '2xs' | 'xs' | 'sm';
type SmallTextMinWidth = '3ch';

const MAX_WIDTH: Record<SmallTextMaxWidth, string> = {
  '2xs': 'max-w-[8rem]',
  xs: 'max-w-[13rem]',
  sm: 'max-w-[16rem]',
};

const MIN_WIDTH: Record<SmallTextMinWidth, string> = {
  '3ch': 'min-w-[3ch]',
};

interface SmallTextProps
  extends Omit<React.ComponentProps<'span'>, 'className' | 'style'> {
  centered?: boolean;
  mono?: boolean;
  noWrap?: boolean;
  truncate?: boolean;
  srOnly?: boolean;
  size?: Exclude<TextSize, 'base'>;
  weight?: FontWeight;
  color?: TextColor;
  italic?: boolean;
  tabularNums?: boolean;
  wrap?: boolean;
  spaceLeft?: SpacingSize;
  maxWidth?: SmallTextMaxWidth;
  minWidth?: SmallTextMinWidth;
  block?: boolean;
  spaceAbove?: SpacingSize;
  spaceInlineStart?: 'auto';
}

function SmallText({
  centered,
  mono,
  noWrap,
  truncate,
  srOnly,
  size = 'xs',
  weight,
  color = 'default',
  italic,
  tabularNums,
  wrap,
  spaceLeft,
  maxWidth,
  minWidth,
  block,
  spaceAbove,
  spaceInlineStart,
  ref,
  ...props
}: SmallTextProps) {
  return (
    <span
      ref={ref}
      className={cn(
        TEXT_SIZE[size],
        TEXT_COLOR[color],
        weight && FONT_WEIGHT[weight],
        centered && 'text-center',
        mono && 'font-mono',
        noWrap && 'whitespace-nowrap',
        truncate && 'truncate',
        srOnly && 'sr-only',
        italic && 'italic',
        tabularNums && 'tabular-nums',
        wrap && 'text-wrap',
        spaceLeft && SPACE_LEFT[spaceLeft],
        maxWidth && MAX_WIDTH[maxWidth],
        minWidth && MIN_WIDTH[minWidth],
        block && 'block',
        spaceAbove && SPACE_ABOVE[spaceAbove],
        spaceInlineStart === 'auto' && 'ms-auto',
      )}
      {...props}
    />
  );
}

export { SmallText };
export type { SmallTextProps };
