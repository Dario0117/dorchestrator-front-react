import { cn } from '@/lib/utils';

interface SecondaryTextProps
  extends Omit<React.ComponentProps<'span'>, 'className'> {
  centered?: boolean;
}

function SecondaryText({ centered, ref, ...props }: SecondaryTextProps) {
  return (
    <span
      ref={ref}
      className={cn('text-sm text-muted-foreground', centered && 'text-center')}
      {...props}
    />
  );
}

export { SecondaryText };
export type { SecondaryTextProps };
