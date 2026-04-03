import { Badge as ShadcnBadge } from '@components/ui/badge';
import { type BadgeStyle, badgeStyles } from '@lib/badge-styles';
import { cn } from '@lib/utils';

type ShadcnBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps
  extends Omit<React.ComponentProps<'span'>, 'className' | 'style'> {
  variant?: ShadcnBadgeVariant;
  colorScheme?: BadgeStyle;
  compact?: boolean;
  tiny?: boolean;
}

function Badge({
  variant = 'default',
  colorScheme,
  compact,
  tiny,
  ...props
}: BadgeProps) {
  return (
    <ShadcnBadge
      variant={variant}
      className={cn(
        colorScheme && badgeStyles[colorScheme],
        compact && 'rounded-full px-1 py-0 text-xs',
        tiny && 'px-1.5 py-0.5 text-[10px]',
      )}
      {...props}
    />
  );
}

export { Badge };
