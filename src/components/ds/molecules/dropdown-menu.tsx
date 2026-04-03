import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuGroup as ShadcnDropdownMenuGroup,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuLabel as ShadcnDropdownMenuLabel,
  DropdownMenuPortal as ShadcnDropdownMenuPortal,
  DropdownMenuRadioGroup as ShadcnDropdownMenuRadioGroup,
  DropdownMenuRadioItem as ShadcnDropdownMenuRadioItem,
  DropdownMenuSeparator as ShadcnDropdownMenuSeparator,
  DropdownMenuSub as ShadcnDropdownMenuSub,
  DropdownMenuSubContent as ShadcnDropdownMenuSubContent,
  DropdownMenuSubTrigger as ShadcnDropdownMenuSubTrigger,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { cn } from '@lib/utils';

type ShadcnDropdownMenuProps = React.ComponentProps<typeof ShadcnDropdownMenu>;
interface DropdownMenuProps extends ShadcnDropdownMenuProps {}

type ShadcnDropdownMenuPortalProps = React.ComponentProps<
  typeof ShadcnDropdownMenuPortal
>;
interface DropdownMenuPortalProps extends ShadcnDropdownMenuPortalProps {}

type ShadcnDropdownMenuTriggerProps = React.ComponentProps<
  typeof ShadcnDropdownMenuTrigger
>;
interface DropdownMenuTriggerProps extends ShadcnDropdownMenuTriggerProps {}

type ShadcnDropdownMenuContentProps = React.ComponentProps<
  typeof ShadcnDropdownMenuContent
>;
type DropdownMenuContentWidth = 'sm' | 'md' | 'lg' | 'anchor';
const DD_CONTENT_WIDTH: Record<DropdownMenuContentWidth, string> = {
  sm: 'w-56',
  md: 'w-80 md:w-96',
  lg: 'w-80 md:w-96',
  anchor: 'w-(--anchor-width) min-w-56 rounded-lg',
};
interface DropdownMenuContentProps
  extends Omit<ShadcnDropdownMenuContentProps, 'className' | 'style'> {
  width?: DropdownMenuContentWidth;
}

type ShadcnDropdownMenuGroupProps = React.ComponentProps<
  typeof ShadcnDropdownMenuGroup
>;
interface DropdownMenuGroupProps extends ShadcnDropdownMenuGroupProps {}

type ShadcnDropdownMenuLabelProps = React.ComponentProps<
  typeof ShadcnDropdownMenuLabel
>;
type DropdownMenuLabelLayout = 'between' | 'normal' | 'muted-xs';
interface DropdownMenuLabelProps
  extends Omit<ShadcnDropdownMenuLabelProps, 'className' | 'style'> {
  layout?: DropdownMenuLabelLayout;
}

type ShadcnDropdownMenuItemProps = React.ComponentProps<
  typeof ShadcnDropdownMenuItem
>;
interface DropdownMenuItemProps
  extends Omit<ShadcnDropdownMenuItemProps, 'className' | 'style'> {
  color?: 'destructive';
  layout?: 'spaced' | 'notification';
  indent?: boolean;
  active?: boolean;
  muted?: boolean;
}

type ShadcnDropdownMenuCheckboxItemProps = React.ComponentProps<
  typeof ShadcnDropdownMenuCheckboxItem
>;
interface DropdownMenuCheckboxItemProps
  extends ShadcnDropdownMenuCheckboxItemProps {}

type ShadcnDropdownMenuRadioGroupProps = React.ComponentProps<
  typeof ShadcnDropdownMenuRadioGroup
>;
interface DropdownMenuRadioGroupProps
  extends ShadcnDropdownMenuRadioGroupProps {}

type ShadcnDropdownMenuRadioItemProps = React.ComponentProps<
  typeof ShadcnDropdownMenuRadioItem
>;
interface DropdownMenuRadioItemProps
  extends Omit<ShadcnDropdownMenuRadioItemProps, 'className' | 'style'> {
  indented?: boolean;
}

type ShadcnDropdownMenuSeparatorProps = React.ComponentProps<
  typeof ShadcnDropdownMenuSeparator
>;
interface DropdownMenuSeparatorProps extends ShadcnDropdownMenuSeparatorProps {}

type ShadcnDropdownMenuSubProps = React.ComponentProps<
  typeof ShadcnDropdownMenuSub
>;
interface DropdownMenuSubProps extends ShadcnDropdownMenuSubProps {}

type ShadcnDropdownMenuSubTriggerProps = React.ComponentProps<
  typeof ShadcnDropdownMenuSubTrigger
>;
interface DropdownMenuSubTriggerProps
  extends ShadcnDropdownMenuSubTriggerProps {}

type ShadcnDropdownMenuSubContentProps = React.ComponentProps<
  typeof ShadcnDropdownMenuSubContent
>;
interface DropdownMenuSubContentProps
  extends ShadcnDropdownMenuSubContentProps {}

function DropdownMenu(props: DropdownMenuProps) {
  return <ShadcnDropdownMenu {...props} />;
}

function DropdownMenuPortal(props: DropdownMenuPortalProps) {
  return <ShadcnDropdownMenuPortal {...props} />;
}

function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <ShadcnDropdownMenuTrigger {...props} />;
}

function DropdownMenuContent({ width, ...props }: DropdownMenuContentProps) {
  return (
    <ShadcnDropdownMenuContent
      className={cn('p-1', width && DD_CONTENT_WIDTH[width])}
      {...props}
    />
  );
}

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <ShadcnDropdownMenuGroup {...props} />;
}

function DropdownMenuLabel({ layout, ...props }: DropdownMenuLabelProps) {
  return (
    <ShadcnDropdownMenuLabel
      className={cn(
        layout === 'between' && 'flex items-center justify-between',
        layout === 'normal' && 'px-2 py-1.5 font-normal',
        layout === 'muted-xs' && 'text-muted-foreground text-xs',
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  color,
  layout,
  indent,
  active,
  muted,
  ...props
}: DropdownMenuItemProps) {
  return (
    <ShadcnDropdownMenuItem
      className={cn(
        'cursor-pointer',
        color === 'destructive' && 'text-destructive',
        layout === 'spaced' && 'gap-2 p-2',
        layout === 'notification' && 'flex flex-col items-start gap-1 p-3',
        indent && 'pl-10',
        active && 'bg-secondary',
        muted && 'opacity-60',
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  return <ShadcnDropdownMenuCheckboxItem {...props} />;
}

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <ShadcnDropdownMenuRadioGroup {...props} />;
}

function DropdownMenuRadioItem({
  indented,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <ShadcnDropdownMenuRadioItem
      className={cn('cursor-pointer', indented && 'pl-10')}
      {...props}
    />
  );
}

function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  return <ShadcnDropdownMenuSeparator {...props} />;
}

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <ShadcnDropdownMenuSub {...props} />;
}

function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  return <ShadcnDropdownMenuSubTrigger {...props} />;
}

function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  return <ShadcnDropdownMenuSubContent {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
