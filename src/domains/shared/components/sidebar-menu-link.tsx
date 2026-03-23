import { SmallText } from '@components/ds/atoms/small-text';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ds/organisms/sidebar';
import { checkIsActive } from '@domains/shared/components/check-is-active';
import { NavBadge } from '@domains/shared/components/nav-badge';
import type { NavLink } from '@domains/shared/components/nav-group.types';
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
        render={
          <Link
            to={item.url}
            onClick={() => setOpenMobile(false)}
          />
        }
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        {item.icon && <item.icon />}
        <SmallText>{item.title}</SmallText>
        {item.badge && <NavBadge>{item.badge}</NavBadge>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
