import { cn } from '@/lib/utils';

interface CodeTextProps
  extends Omit<React.ComponentProps<'span'>, 'className' | 'style'> {
  truncate?: boolean;
  block?: boolean;
}

function CodeText({ truncate, block, ref, ...props }: CodeTextProps) {
  return (
    <span
      ref={ref}
      className={cn(
        'font-mono text-sm break-all',
        truncate && 'truncate',
        block && 'mt-0.5 block',
      )}
      {...props}
    />
  );
}

export { CodeText };
