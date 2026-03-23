import {
  type statusDotVariants,
  StatusDot as UiStatusDot,
} from '@components/ui/status-dot';
import type { VariantProps } from 'class-variance-authority';

type StatusDotVariants = VariantProps<typeof statusDotVariants>;

interface StatusDotProps extends StatusDotVariants {
  'aria-label': string;
}

function StatusDot({
  size = 'default',
  status = 'offline',
  'aria-label': ariaLabel,
}: StatusDotProps) {
  return (
    <UiStatusDot
      size={size}
      status={status}
      aria-label={ariaLabel}
    />
  );
}

export { StatusDot };
export type { StatusDotProps };
