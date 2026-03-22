import { cn } from '@/lib/utils';

function CodeText({ className, ref, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      ref={ref}
      className={cn('font-mono text-sm', className)}
      {...props}
    />
  );
}

export { CodeText };
