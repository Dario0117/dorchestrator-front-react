import { Badge as ShadcnBadge } from '@components/ui/badge';
import { type BadgeStyle, badgeStyles } from '@lib/badge-styles';
import { cn } from '@lib/utils';

type ShadcnBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

interface BadgeProps extends React.ComponentProps<'span'> {
  variant?: ShadcnBadgeVariant;
  colorScheme?: BadgeStyle;
  compact?: boolean;
}

function Badge({
  variant = 'default',
  colorScheme,
  compact,
  className,
  ...props
}: BadgeProps) {
  return (
    <ShadcnBadge
      variant={variant}
      className={cn(
        colorScheme && badgeStyles[colorScheme],
        compact && 'rounded-full px-1 py-0 text-xs',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
