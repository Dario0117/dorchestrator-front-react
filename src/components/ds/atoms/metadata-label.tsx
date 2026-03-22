import { cn } from '@/lib/utils';

function MetadataLabel({
  className,
  ref,
  ...props
}: React.ComponentProps<'dt'>) {
  return (
    <dt
      ref={ref}
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

export { MetadataLabel };
