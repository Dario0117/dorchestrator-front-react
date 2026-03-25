import {
  Sidebar as UiSidebar,
  SidebarContent as UiSidebarContent,
  SidebarFooter as UiSidebarFooter,
  SidebarGroup as UiSidebarGroup,
  SidebarGroupAction as UiSidebarGroupAction,
  SidebarGroupContent as UiSidebarGroupContent,
  SidebarGroupLabel as UiSidebarGroupLabel,
  SidebarHeader as UiSidebarHeader,
  SidebarInput as UiSidebarInput,
  SidebarInset as UiSidebarInset,
  SidebarMenu as UiSidebarMenu,
  SidebarMenuAction as UiSidebarMenuAction,
  SidebarMenuBadge as UiSidebarMenuBadge,
  SidebarMenuButton as UiSidebarMenuButton,
  SidebarMenuItem as UiSidebarMenuItem,
  SidebarMenuSkeleton as UiSidebarMenuSkeleton,
  SidebarMenuSub as UiSidebarMenuSub,
  SidebarMenuSubButton as UiSidebarMenuSubButton,
  SidebarMenuSubItem as UiSidebarMenuSubItem,
  SidebarProvider as UiSidebarProvider,
  SidebarRail as UiSidebarRail,
  SidebarSeparator as UiSidebarSeparator,
  SidebarTrigger as UiSidebarTrigger,
  useSidebar,
} from '@components/ui/sidebar';
import { cn } from '@lib/utils';

function SidebarProvider({
  defaultOpen,
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof UiSidebarProvider>) {
  return (
    <UiSidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      {...props}
    />
  );
}

function Sidebar({
  side,
  variant,
  collapsible,
  ...props
}: React.ComponentProps<typeof UiSidebar>) {
  return (
    <UiSidebar
      aria-label="Main navigation"
      side={side}
      variant={variant}
      collapsible={collapsible}
      {...props}
    />
  );
}

function SidebarTrigger(props: React.ComponentProps<typeof UiSidebarTrigger>) {
  return <UiSidebarTrigger {...props} />;
}

function SidebarRail(props: React.ComponentProps<typeof UiSidebarRail>) {
  return <UiSidebarRail {...props} />;
}

function SidebarInset(
  props: Omit<React.ComponentProps<typeof UiSidebarInset>, 'className'>,
) {
  return (
    <UiSidebarInset
      id="content"
      className={cn(
        '@container/content',
        'pb-14 md:pb-0',
        'has-[[data-layout=fixed]]:h-svh',
        'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]',
      )}
      {...props}
    />
  );
}

function SidebarInput(props: React.ComponentProps<typeof UiSidebarInput>) {
  return <UiSidebarInput {...props} />;
}

function SidebarHeader(props: React.ComponentProps<typeof UiSidebarHeader>) {
  return <UiSidebarHeader {...props} />;
}

function SidebarFooter(props: React.ComponentProps<typeof UiSidebarFooter>) {
  return <UiSidebarFooter {...props} />;
}

function SidebarSeparator(
  props: React.ComponentProps<typeof UiSidebarSeparator>,
) {
  return <UiSidebarSeparator {...props} />;
}

function SidebarContent(props: React.ComponentProps<typeof UiSidebarContent>) {
  return <UiSidebarContent {...props} />;
}

function SidebarGroup(props: React.ComponentProps<typeof UiSidebarGroup>) {
  return <UiSidebarGroup {...props} />;
}

function SidebarGroupLabel(
  props: React.ComponentProps<typeof UiSidebarGroupLabel>,
) {
  return <UiSidebarGroupLabel {...props} />;
}

function SidebarGroupAction(
  props: React.ComponentProps<typeof UiSidebarGroupAction>,
) {
  return <UiSidebarGroupAction {...props} />;
}

function SidebarGroupContent(
  props: React.ComponentProps<typeof UiSidebarGroupContent>,
) {
  return <UiSidebarGroupContent {...props} />;
}

function SidebarMenu(props: React.ComponentProps<typeof UiSidebarMenu>) {
  return <UiSidebarMenu {...props} />;
}

function SidebarMenuItem(
  props: React.ComponentProps<typeof UiSidebarMenuItem>,
) {
  return <UiSidebarMenuItem {...props} />;
}

function SidebarMenuButton({
  variant,
  size,
  isActive,
  tooltip,
  className,
  ...props
}: React.ComponentProps<typeof UiSidebarMenuButton>) {
  return (
    <UiSidebarMenuButton
      variant={variant}
      size={size}
      isActive={isActive}
      tooltip={tooltip}
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}

function SidebarMenuAction(
  props: React.ComponentProps<typeof UiSidebarMenuAction>,
) {
  return <UiSidebarMenuAction {...props} />;
}

function SidebarMenuBadge(
  props: React.ComponentProps<typeof UiSidebarMenuBadge>,
) {
  return <UiSidebarMenuBadge {...props} />;
}

function SidebarMenuSkeleton(
  props: React.ComponentProps<typeof UiSidebarMenuSkeleton>,
) {
  return <UiSidebarMenuSkeleton {...props} />;
}

function SidebarMenuSub(props: React.ComponentProps<typeof UiSidebarMenuSub>) {
  return <UiSidebarMenuSub {...props} />;
}

function SidebarMenuSubItem(
  props: React.ComponentProps<typeof UiSidebarMenuSubItem>,
) {
  return <UiSidebarMenuSubItem {...props} />;
}

function SidebarMenuSubButton(
  props: React.ComponentProps<typeof UiSidebarMenuSubButton>,
) {
  return <UiSidebarMenuSubButton {...props} />;
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
