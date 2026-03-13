import type { NavGroup as NavGroupProps } from '@components/layout/nav-group.types';
import { SidebarMenuCollapsedDropdown } from '@components/layout/sidebar-menu-collapsed-dropdown';
import { SidebarMenuCollapsible } from '@components/layout/sidebar-menu-collapsible';
import { SidebarMenuLink } from '@components/layout/sidebar-menu-link';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from '@components/ui/sidebar';
import { useLocation } from '@tanstack/react-router';

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  const href = useLocation({ select: (location) => location.href });
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items) {
            return (
              <SidebarMenuLink
                key={key}
                item={item}
                href={href}
              />
            );
          }

          if (state === 'collapsed' && !isMobile) {
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                href={href}
              />
            );
          }

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              href={href}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
