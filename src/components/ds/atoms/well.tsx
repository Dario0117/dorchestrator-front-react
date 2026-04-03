import type {
  BgOption,
  BorderOption,
  RoundedOption,
} from '@components/ds/utils/tokens';
import { BG, BORDER, ROUNDED } from '@components/ds/utils/tokens';
import { cn } from '@lib/utils';

type WellPadding = 'sm' | 'md' | 'lg';

const PADDING: Record<WellPadding, string> = {
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

interface WellProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  padding?: WellPadding;
  border?: BorderOption;
  rounded?: RoundedOption;
  bg?: BgOption;
  translucent?: 'muted' | 'primary' | 'destructive';
}

const TRANSLUCENT: Record<string, string> = {
  muted: 'bg-muted/30',
  primary: 'bg-primary/10',
  destructive: 'bg-destructive/10',
};

function Well({
  padding = 'md',
  border = 'all',
  rounded = 'md',
  bg,
  translucent,
  ...props
}: WellProps) {
  return (
    <div
      className={cn(
        PADDING[padding],
        BORDER[border],
        ROUNDED[rounded],
        bg && BG[bg],
        translucent && TRANSLUCENT[translucent],
      )}
      {...props}
    />
  );
}

export { Well };
