import { cn } from '@/lib/utils';

function DefinitionList({
  className,
  ref,
  ...props
}: React.ComponentProps<'dl'>) {
  return (
    <dl
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    />
  );
}

export { DefinitionList };
