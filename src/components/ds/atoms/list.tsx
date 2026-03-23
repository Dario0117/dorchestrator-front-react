import { cn } from '@lib/utils';

type ListVariant = 'default' | 'error';

const VARIANT: Record<ListVariant, string> = {
  default: 'list-disc pl-4',
  error: 'text-sm text-destructive',
};

interface ListProps
  extends Omit<React.ComponentProps<'ul'>, 'className' | 'style'> {
  variant?: ListVariant;
}

function List({ variant = 'default', ref, ...props }: ListProps) {
  return (
    <ul
      ref={ref}
      className={cn(VARIANT[variant])}
      {...props}
    />
  );
}

interface ListItemProps
  extends Omit<React.ComponentProps<'li'>, 'className' | 'style'> {}

function ListItem({ ref, ...props }: ListItemProps) {
  return (
    <li
      ref={ref}
      {...props}
    />
  );
}

export { List, ListItem };
export type { ListProps, ListItemProps };
