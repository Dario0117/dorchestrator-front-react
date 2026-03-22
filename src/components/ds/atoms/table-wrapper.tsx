import { cn } from '@/lib/utils';

function TableWrapper({
  className,
  ref,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      ref={ref}
      className={cn('rounded-md border', className)}
      {...props}
    />
  );
}

export { TableWrapper };
