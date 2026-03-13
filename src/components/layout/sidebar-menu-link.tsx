import { checkIsActive } from '@components/layout/check-is-active';
import { NavBadge } from '@components/layout/nav-badge';
import type { NavLink } from '@components/layout/nav-group.types';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ui/sidebar';
import { Link } from '@tanstack/react-router';

export function SidebarMenuLink({
  item,
  href,
}: {
  item: NavLink;
  href: string;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        <Link
          to={item.url}
          onClick={() => setOpenMobile(false)}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
