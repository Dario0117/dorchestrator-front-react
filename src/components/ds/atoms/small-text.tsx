import { cn } from '@/lib/utils';

interface SmallTextProps
  extends Omit<React.ComponentProps<'span'>, 'className'> {
  centered?: boolean;
  mono?: boolean;
  noWrap?: boolean;
  truncate?: boolean;
}

function SmallText({
  centered,
  mono,
  noWrap,
  truncate,
  ref,
  ...props
}: SmallTextProps) {
  return (
    <span
      ref={ref}
      className={cn(
        'text-xs text-muted-foreground',
        centered && 'text-center',
        mono && 'font-mono',
        noWrap && 'whitespace-nowrap',
        truncate && 'truncate',
      )}
      {...props}
    />
  );
}

export { SmallText };
export type { SmallTextProps };
