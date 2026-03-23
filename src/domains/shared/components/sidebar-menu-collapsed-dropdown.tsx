import { SmallText } from '@components/ds/atoms/small-text';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ds/molecules/dropdown-menu';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from '@components/ds/organisms/sidebar';
import { checkIsActive } from '@domains/shared/components/check-is-active';
import { NavBadge } from '@domains/shared/components/nav-badge';
import type { NavCollapsible } from '@domains/shared/components/nav-group.types';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

export function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              tooltip={item.title}
              isActive={checkIsActive(href, item)}
            />
          }
        >
          {item.icon && <item.icon />}
          <SmallText>{item.title}</SmallText>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
          <ChevronRight className="ms-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              {item.title} {item.badge ? `(${item.badge})` : ''}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem
              key={`${sub.title}-${sub.url}`}
              active={checkIsActive(href, sub)}
              render={<Link to={sub.url} />}
            >
              {sub.icon && <sub.icon />}
              <SmallText
                wrap
                maxWidth="xs"
              >
                {sub.title}
              </SmallText>
              {sub.badge && (
                <SmallText spaceInlineStart="auto">{sub.badge}</SmallText>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
