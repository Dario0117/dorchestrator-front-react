import { cn } from '@/lib/utils';

function SecondaryText({
  className,
  ref,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { SecondaryText };
