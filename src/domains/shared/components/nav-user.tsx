import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@components/ds/atoms/avatar';
import { HStack } from '@components/ds/atoms/hstack';
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ds/organisms/sidebar';
import type { NavUserProps } from '@domains/shared/components/nav-user.types';
import { SidebarItemDetail } from '@domains/shared/components/sidebar-item-detail';
import { SignOutDialog } from '@domains/shared/components/sign-out-dialog';
import useDialogState from '@domains/shared/hooks/use-dialog-state';
import { Link } from '@tanstack/react-router';
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useDialogState();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar
                size="sm"
                rounded="lg"
              >
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                />
                <AvatarFallback rounded="lg">SN</AvatarFallback>
              </Avatar>
              <SidebarItemDetail>
                <SmallText
                  size="sm"
                  weight="semibold"
                  truncate
                >
                  {user.name}
                </SmallText>
                <SmallText truncate>{user.email}</SmallText>
              </SidebarItemDetail>
              <ChevronsUpDown className="ms-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              width="anchor"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel layout="normal">
                  <HStack
                    gap="sm"
                    innerSpaceX="xs"
                    innerSpaceY="xs"
                    textSize="sm"
                    textAlign="left"
                  >
                    <Avatar
                      size="sm"
                      rounded="lg"
                    >
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                      />
                      <AvatarFallback rounded="lg">SN</AvatarFallback>
                    </Avatar>
                    <SidebarItemDetail>
                      <SmallText
                        size="sm"
                        weight="semibold"
                        truncate
                      >
                        {user.name}
                      </SmallText>
                      <SmallText truncate>{user.email}</SmallText>
                    </SidebarItemDetail>
                  </HStack>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link to="." />}>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link to="." />}>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link to="." />}>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog
        open={!!open}
        onOpenChange={setOpen}
      />
    </>
  );
}
