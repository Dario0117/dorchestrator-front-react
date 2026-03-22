import { cn } from '@/lib/utils';

function SmallText({ className, ref, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      ref={ref}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export { SmallText };
