import { cn } from '@lib/utils';

interface DefinitionValueProps
  extends Omit<React.ComponentProps<'dd'>, 'className' | 'style'> {
  mono?: boolean;
}

function DefinitionValue({ mono, ref, ...props }: DefinitionValueProps) {
  return (
    <dd
      ref={ref}
      className={cn('text-base', mono && 'font-mono')}
      {...props}
    />
  );
}

export { DefinitionValue };
