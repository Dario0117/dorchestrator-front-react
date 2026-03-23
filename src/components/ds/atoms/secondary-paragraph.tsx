import type {
  FixedSpacingSize,
  FontWeight,
  LeadingOption,
  TextColor,
  TextSize,
} from '@components/ds/utils/tokens';
import {
  FONT_WEIGHT,
  INNER_Y,
  LEADING,
  TEXT_COLOR,
  TEXT_SIZE,
} from '@components/ds/utils/tokens';
import { cn } from '@/lib/utils';

interface SecondaryParagraphProps
  extends Omit<React.ComponentProps<'p'>, 'className' | 'style'> {
  size?: Exclude<TextSize, 'base'>;
  weight?: Extract<FontWeight, 'normal' | 'medium'>;
  color?: Extract<TextColor, 'default' | 'muted' | 'destructive'>;
  centered?: boolean;
  truncate?: boolean;
  innerSpaceY?: Exclude<FixedSpacingSize, 'xs' | 'xl'>;
  leading?: LeadingOption;
}

function SecondaryParagraph({
  size = 'sm',
  weight = 'normal',
  color = 'muted',
  centered,
  truncate,
  innerSpaceY,
  leading,
  ref,
  ...props
}: SecondaryParagraphProps) {
  return (
    <p
      ref={ref}
      className={cn(
        TEXT_SIZE[size],
        TEXT_COLOR[color],
        FONT_WEIGHT[weight],
        centered && 'text-center',
        truncate && 'truncate',
        innerSpaceY && INNER_Y[innerSpaceY],
        leading && LEADING[leading],
      )}
      {...props}
    />
  );
}

export { SecondaryParagraph };
export type { SecondaryParagraphProps };
