import { Separator as ShadcnSeparator } from '@components/ui/separator';
import { cn } from '@lib/utils';

type ShadcnSeparatorProps = React.ComponentProps<typeof ShadcnSeparator>;

interface SeparatorProps
  extends Omit<ShadcnSeparatorProps, 'className' | 'style'> {
  stretch?: boolean;
}

function Separator({ stretch, ...props }: SeparatorProps) {
  return (
    <ShadcnSeparator
      className={cn(stretch && 'mx-1 h-auto self-stretch')}
      {...props}
    />
  );
}

export { Separator };
export type { SeparatorProps };
