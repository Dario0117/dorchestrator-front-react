import { cn } from '@lib/utils';

type PageHeaderPosition = 'sticky';

const POSITION: Record<PageHeaderPosition, string> = {
  sticky: 'header-fixed peer/header sticky top-0 w-[inherit]',
};

type PageHeaderShadow = 'sm' | 'none';

const SHADOW: Record<PageHeaderShadow, string> = {
  sm: 'shadow',
  none: 'shadow-none',
};

interface PageHeaderProps
  extends Omit<React.ComponentProps<'header'>, 'className' | 'style'> {
  position?: PageHeaderPosition;
  shadow?: PageHeaderShadow;
}

function PageHeader({ position, shadow, ref, ...props }: PageHeaderProps) {
  return (
    <header
      ref={ref}
      className={cn(
        'z-50 h-16',
        position && POSITION[position],
        shadow && SHADOW[shadow],
      )}
      {...props}
    />
  );
}

export { PageHeader };
export type { PageHeaderProps };
