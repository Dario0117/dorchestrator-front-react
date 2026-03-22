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
interface DropdownMenuContentProps extends ShadcnDropdownMenuContentProps {}

type ShadcnDropdownMenuGroupProps = React.ComponentProps<
  typeof ShadcnDropdownMenuGroup
>;
interface DropdownMenuGroupProps extends ShadcnDropdownMenuGroupProps {}

type ShadcnDropdownMenuLabelProps = React.ComponentProps<
  typeof ShadcnDropdownMenuLabel
>;
interface DropdownMenuLabelProps extends ShadcnDropdownMenuLabelProps {}

type ShadcnDropdownMenuItemProps = React.ComponentProps<
  typeof ShadcnDropdownMenuItem
>;
interface DropdownMenuItemProps extends ShadcnDropdownMenuItemProps {}

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
interface DropdownMenuRadioItemProps extends ShadcnDropdownMenuRadioItemProps {}

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

function DropdownMenuContent(props: DropdownMenuContentProps) {
  return <ShadcnDropdownMenuContent {...props} />;
}

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <ShadcnDropdownMenuGroup {...props} />;
}

function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  return <ShadcnDropdownMenuLabel {...props} />;
}

function DropdownMenuItem(props: DropdownMenuItemProps) {
  return <ShadcnDropdownMenuItem {...props} />;
}

function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  return <ShadcnDropdownMenuCheckboxItem {...props} />;
}

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <ShadcnDropdownMenuRadioGroup {...props} />;
}

function DropdownMenuRadioItem(props: DropdownMenuRadioItemProps) {
  return <ShadcnDropdownMenuRadioItem {...props} />;
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
export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuPortalProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
};
