import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const statusDotVariants = cva('inline-block shrink-0 rounded-full', {
  variants: {
    size: {
      sm: 'h-1.5 w-1.5',
      default: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    },
    status: {
      online: 'bg-success',
      success: 'bg-success',
      completed: 'bg-success',
      offline: 'bg-muted-foreground',
      running: 'bg-info animate-status-pulse',
      active: 'bg-info animate-status-pulse',
      pending: 'bg-warning animate-status-pulse',
      failed: 'bg-destructive',
      error: 'bg-destructive',
    },
  },
  defaultVariants: {
    size: 'default',
    status: 'offline',
  },
});

type StatusDotVariants = VariantProps<typeof statusDotVariants>;

function StatusDot({
  className,
  size = 'default',
  status = 'offline',
  'aria-label': ariaLabel,
  ref,
  ...props
}: Omit<React.ComponentProps<'span'>, 'children'> &
  StatusDotVariants & {
    'aria-label': string;
  }) {
  return (
    <span
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      data-slot="status-dot"
      className={cn(statusDotVariants({ size, status }), className)}
      {...props}
    />
  );
}

export { StatusDot, statusDotVariants };
