import { cn } from '@/lib/utils';

function SecondaryParagraph({
  className,
  ref,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { SecondaryParagraph };
