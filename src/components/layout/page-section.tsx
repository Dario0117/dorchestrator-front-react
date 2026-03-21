import { cn } from '@lib/utils';

export function PageSection({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('p-6 md:p-10 space-y-6', className)}
      {...props}
    >
      {children}
    </section>
  );
}
