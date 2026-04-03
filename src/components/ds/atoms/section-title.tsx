import { cn } from '@lib/utils';

type SectionTitleSize = 'sm' | 'lg' | 'xl' | '2xl';

const SIZE: Record<SectionTitleSize, string> = {
  sm: 'text-sm font-medium',
  lg: 'text-lg font-semibold',
  xl: 'text-xl font-semibold',
  '2xl': 'text-2xl font-semibold',
};

interface SectionTitleProps
  extends Omit<React.ComponentProps<'h1'>, 'className' | 'style'> {
  size?: SectionTitleSize;
}

export function SectionTitle({
  children,
  size = '2xl',
  ...props
}: SectionTitleProps) {
  return (
    <h1
      className={cn(SIZE[size])}
      {...props}
    >
      {children}
    </h1>
  );
}
