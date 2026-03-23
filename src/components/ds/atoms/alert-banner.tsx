import { cn } from '@lib/utils';

type AlertBannerVariant = 'destructive' | 'warning';

const VARIANT: Record<AlertBannerVariant, string> = {
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
};

interface AlertBannerProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  variant?: AlertBannerVariant;
  inline?: boolean;
}

function AlertBanner({
  variant = 'destructive',
  inline,
  ...props
}: AlertBannerProps) {
  return (
    <div
      className={cn(
        'border px-3 py-2 text-sm',
        inline ? 'shrink-0 border-x-0 border-t-0 text-center' : 'rounded-md',
        VARIANT[variant],
      )}
      {...props}
    />
  );
}

export { AlertBanner };
export type { AlertBannerProps };
