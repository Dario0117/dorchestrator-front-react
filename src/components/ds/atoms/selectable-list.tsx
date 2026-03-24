import { cn } from '@lib/utils';

interface SelectableListProps
  extends Omit<React.ComponentProps<'ul'>, 'className' | 'style'> {}

function SelectableList({ ref, ...props }: SelectableListProps) {
  return (
    <ul
      ref={ref}
      className="list-none"
      {...props}
    />
  );
}

interface SelectableListItemProps
  extends Omit<React.ComponentProps<'li'>, 'className' | 'style'> {
  active?: boolean;
}

function SelectableListItem({
  active,
  ref,
  ...props
}: SelectableListItemProps) {
  return (
    <li
      ref={ref}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2',
        'hover:bg-accent hover:text-accent-foreground',
        active && 'bg-accent text-accent-foreground',
      )}
      {...props}
    />
  );
}

export { SelectableList, SelectableListItem };
export type { SelectableListItemProps, SelectableListProps };
