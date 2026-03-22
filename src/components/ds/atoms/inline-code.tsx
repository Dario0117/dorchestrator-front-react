import { cn } from '@/lib/utils';

function InlineCode({
  className,
  ref,
  ...props
}: React.ComponentProps<'code'>) {
  return (
    <code
      ref={ref}
      className={cn('font-mono text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export { InlineCode };
