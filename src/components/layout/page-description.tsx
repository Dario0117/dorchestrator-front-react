import { cn } from '@lib/utils';

export function PageDescription({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
}
