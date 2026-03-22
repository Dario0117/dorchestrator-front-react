import { cn } from '@/lib/utils';

interface CodeTextProps
  extends Omit<React.ComponentProps<'span'>, 'className'> {
  truncate?: boolean;
}

function CodeText({ truncate, ref, ...props }: CodeTextProps) {
  return (
    <span
      ref={ref}
      className={cn('font-mono text-sm', truncate && 'truncate')}
      {...props}
    />
  );
}

export { CodeText };
export type { CodeTextProps };
