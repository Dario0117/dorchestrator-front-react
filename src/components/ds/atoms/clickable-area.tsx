import { cn } from '@lib/utils';

type ClickableAreaSize = 'sm' | 'md' | 'lg';

const SIZE: Record<ClickableAreaSize, string> = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

interface ClickableAreaProps
  extends Omit<React.ComponentProps<'button'>, 'className' | 'style' | 'type'> {
  size?: ClickableAreaSize;
  rounded?: boolean;
}

function ClickableArea({ size, rounded, ref, ...props }: ClickableAreaProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'group relative overflow-hidden border hover:ring-2 hover:ring-primary',
        size && SIZE[size],
        rounded ? 'rounded-lg' : 'rounded',
      )}
      {...props}
    />
  );
}

export { ClickableArea };
