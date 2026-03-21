import { cn } from '@lib/utils';

export function PageHeadingBar({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
