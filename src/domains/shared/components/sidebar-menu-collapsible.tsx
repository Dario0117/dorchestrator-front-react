import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@components/ds/atoms/collapsible';
import { SmallText } from '@components/ds/atoms/small-text';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@components/ds/organisms/sidebar';
import { checkIsActive } from '@domains/shared/components/check-is-active';
import { NavBadge } from '@domains/shared/components/nav-badge';
import type { NavCollapsible } from '@domains/shared/components/nav-group.types';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

export function SidebarMenuCollapsible({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Collapsible
      render={<SidebarMenuItem />}
      defaultOpen={checkIsActive(href, item, true)}
      group
    >
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
        {item.icon && <item.icon />}
        <SmallText>{item.title}</SmallText>
        {item.badge && <NavBadge>{item.badge}</NavBadge>}
        <ChevronRight className="ms-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent animated>
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                render={
                  <Link
                    to={subItem.url}
                    onClick={() => setOpenMobile(false)}
                  />
                }
                isActive={checkIsActive(href, subItem)}
              >
                {subItem.icon && <subItem.icon />}
                <SmallText>{subItem.title}</SmallText>
                {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
