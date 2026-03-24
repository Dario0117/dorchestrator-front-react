import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

interface BottomNavBarProps
  extends Omit<React.ComponentProps<'nav'>, 'className' | 'style'> {
  hidden?: boolean;
}

function BottomNavBar({ hidden, children, ...props }: BottomNavBarProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t bg-background md:hidden',
        hidden && 'hidden',
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

interface BottomNavBarItemProps
  extends Omit<React.ComponentProps<'div'>, 'className' | 'style'> {
  active?: boolean;
}

function BottomNavBarItem({
  active,
  children,
  ...props
}: BottomNavBarItemProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-1',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BottomNavBarButtonProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    'className' | 'style' | 'variant' | 'size'
  > {}

function BottomNavBarButton({ children, ...props }: BottomNavBarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex h-auto flex-1 flex-col items-center justify-center gap-0.5 rounded-none py-1 text-muted-foreground"
      {...props}
    >
      {children}
    </Button>
  );
}

export { BottomNavBar, BottomNavBarButton, BottomNavBarItem };
export type {
  BottomNavBarButtonProps,
  BottomNavBarItemProps,
  BottomNavBarProps,
};
