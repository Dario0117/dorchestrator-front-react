import { cn } from '@lib/utils';

type OutputVariant = 'inline' | 'status';

const VARIANT: Record<OutputVariant, string> = {
  inline: 'px-2 text-sm',
  status: 'flex min-h-[44px] min-w-[44px] items-center gap-2 px-3 py-2',
};

interface OutputProps
  extends Omit<React.ComponentProps<'output'>, 'className' | 'style'> {
  variant?: OutputVariant;
}

function Output({ variant = 'inline', ref, ...props }: OutputProps) {
  return (
    <output
      ref={ref}
      className={cn(VARIANT[variant])}
      {...props}
    />
  );
}

export { Output };
export type { OutputProps };
