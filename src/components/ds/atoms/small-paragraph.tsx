import { cn } from '@/lib/utils';

function SmallParagraph({
  className,
  ref,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export { SmallParagraph };
