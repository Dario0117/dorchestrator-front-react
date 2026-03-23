import { cn } from '@lib/utils';

interface PageSectionProps
  extends Omit<React.ComponentProps<'section'>, 'className' | 'style'> {
  centered?: boolean;
}

export function PageSection({
  children,
  centered,
  ...props
}: PageSectionProps) {
  return (
    <section
      className={cn(
        'space-y-6 p-6 md:p-10',
        centered && 'flex min-h-svh w-full items-center justify-center',
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export type { PageSectionProps };
