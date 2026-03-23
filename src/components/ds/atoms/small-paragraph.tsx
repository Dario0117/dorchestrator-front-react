import type {
  FontWeight,
  LeadingOption,
  SpacingSize,
  TextColor,
} from '@components/ds/utils/tokens';
import {
  FONT_WEIGHT,
  INNER_Y,
  LEADING,
  SPACE_ABOVE,
  SPACE_BELOW,
  TEXT_COLOR,
} from '@components/ds/utils/tokens';
import { cn } from '@/lib/utils';

interface SmallParagraphProps
  extends Omit<React.ComponentProps<'p'>, 'className' | 'style'> {
  weight?: Extract<FontWeight, 'normal' | 'medium'>;
  color?: Extract<TextColor, 'default' | 'muted'>;
  centered?: boolean;
  truncate?: boolean;
  mono?: boolean;
  innerSpaceY?: 'sm' | 'md' | 'lg';
  leading?: LeadingOption;
  spaceAbove?: SpacingSize;
  spaceBelow?: SpacingSize;
  textAlign?: 'right';
}

function SmallParagraph({
  weight = 'normal',
  color = 'muted',
  centered,
  truncate,
  mono,
  innerSpaceY,
  leading,
  spaceAbove,
  spaceBelow,
  textAlign,
  ref,
  ...props
}: SmallParagraphProps) {
  return (
    <p
      ref={ref}
      className={cn(
        'text-xs text-muted-foreground',
        TEXT_COLOR[color],
        FONT_WEIGHT[weight],
        centered && 'text-center',
        truncate && 'truncate',
        mono && 'font-mono',
        innerSpaceY && INNER_Y[innerSpaceY],
        leading && LEADING[leading],
        spaceAbove && SPACE_ABOVE[spaceAbove],
        spaceBelow && SPACE_BELOW[spaceBelow],
        textAlign === 'right' && 'text-right',
      )}
      {...props}
    />
  );
}

export { SmallParagraph };
export type { SmallParagraphProps };
