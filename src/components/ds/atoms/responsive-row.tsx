import type {
  AlignOption,
  GapSize,
  JustifyOption,
  SpacingSize,
} from '@components/ds/utils/tokens';
import { ALIGN, GAP, JUSTIFY, SPACE_ABOVE } from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

interface ResponsiveRowProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  gap?: GapSize;
  align?: AlignOption;
  justify?: JustifyOption;
  wrap?: boolean;
  spaceAbove?: SpacingSize;
}

function ResponsiveRow({
  gap = 'md',
  align,
  justify,
  wrap,
  spaceAbove,
  ...props
}: ResponsiveRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row',
        gap && GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && 'flex-wrap',
        spaceAbove && SPACE_ABOVE[spaceAbove],
      )}
      {...props}
    />
  );
}

export { ResponsiveRow };
export type { ResponsiveRowProps };
